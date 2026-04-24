# Stagehand vs Browser Use: a caching benchmark for AI-driven browser automation

*Same task, same models, different caching strategies — what the numbers reveal*

This article documents a benchmark comparing **Stagehand** and **Browser Use** on an identical browser automation task, with a focus on caching behavior and LLM token consumption across multiple runs — including a re-run after page content changed. B
oth libraries are evaluated in self-hosted mode only.
All code is open source: [→ repo link](https://github.com/danipisca07/ai-agent-scrapers). 
Clone it, replace the task with your own, and reproduce the comparison against your specific use case.
→ At the end of the article there is also a ready-to-use prompt to let claude code do it all for you.

If you don't know what stagehand and browser-use are, read my introduction on [medium](https://medium.com/@danielepiscaglia/stagehand-vs-browser-use-0f28df1bc938).
---

## The benchmark

### Task and target

The task is simple and deliberate: open the Hacker News homepage, click each of the first 10 story links one at a time, then navigate back to the list after each. Ten sequential steps, no parallelism.

Hacker News is a useful benchmark target for two reasons. Its HTML structure is static and minimal — a plain table from the early web era, almost no JavaScript — which means DOM structure rarely changes between runs. But the *content* changes constantly: articles rotate in and out, rankings shift, titles update. This is exactly the pattern that stresses a cache: structure stable enough to record, content volatile enough to invalidate.

The test sequence was:
- 3 consecutive runs immediately after each other (same page content)
- A second batch of 3 runs several hours later, after the page content had changed

### Metrics

Each run records: number of LLM calls, input and output tokens, and local cache hits. Results are written to JSON files in `results/` and summarized via `compare.py`.

### Models tested

All models were served through **Groq**:
- `openai/gpt-oss-20b` — small, fast, structured-output capable
- `openai/gpt-oss-120b` — larger, more capable at open-ended reasoning
- `meta-llama/llama-4-scout-17b-16e-instruct` — tested as a low-cost alternative

---

## The three implementations

### Stagehand — `index.ts`

Stagehand exposes an `act()` primitive that maps a natural language instruction to a single Playwright action. The script calls `stagehand.act()` once per rank, interleaved with direct Playwright navigation:

```typescript
for (let rank = 1; rank <= 10;) {
  const action = "Click on story title in rank " + rank;
  await stagehand.act(action, options);
  const navigatedOut = !page.url().includes("ycombinator.com");
  await page.goBack();
  if (navigatedOut) { rank++; }
  else { invalidateActCache(action, baseUrl); }
}
```

Post-action validation is manual: if the current URL is still on ycombinator.com, the click didn't work. In that case the cache entry is invalidated explicitly before retrying, forcing a fresh LLM call.

`selfHeal` is disabled in this benchmark (`selfHeal: false`). With self-heal enabled, when a cached xpath fails Stagehand builds a new instruction from the stored `description` field — which contains the visible text of the element at recording time, e.g. `"link: A Periodic Map of Cheese"` — and asks the LLM to find that element on the live page. On a page with rotating content like HN, the original article may still be present but at a different position, and the self-heal would find it and click it there. The script would report success but open the wrong link for that rank. Disabling self-heal converts this into an explicit failure, handled by the retry and cache invalidation logic in the loop.

Note: Stagehand doesn't expose a public token usage API. Token tracking here is done by parsing the internal logger, which emits a structured log line per LLM response.

### Browser Use — agent mode (`scraper-agent.py`)

The full task is assembled as a single natural language string and handed to one `Agent` instance. The agent plans and executes everything autonomously. On the first run it calls the LLM at each step; on subsequent runs, `rerun_history()` replays the entire recorded session without any LLM calls:

```python
task = " ".join(make_task(cfg["n_stories"]))
agent = Agent(task=task, llm=llm, use_vision=False, max_steps=max_steps)

if cfg["use_cache"] and cache_file.exists():
    history = _load_history_safe(cache_file, agent.AgentOutput)
    await agent.rerun_history(history)
else:
    await agent.run()
    agent.history.save_to_file(cache_file)
```

### Browser Use — act-equivalent (`scraper.py`)

To test whether step-by-step decomposition changes the picture, the task is re-implemented by spawning a separate `Agent` instance per instruction, all sharing the same `BrowserSession`. This mirrors Stagehand's `act()` pattern from within the Python ecosystem:

```python
# max_steps=2, not 1: with max_steps=1, browser-use forces a "done-only"
# schema on the first step and the action never executes.
await agent.run(max_steps=2)
```

Each instruction gets its own cache file, keyed by a SHA-256 hash of the instruction string. The caching mechanics are identical to agent mode — `save_to_file` / `rerun_history` — just applied at single-step granularity.

---

## How the caches work

This is the section that explains most of the benchmark results, so it's worth understanding before reading the numbers.

### Stagehand — cache per instruction

Each `act()` call produces a cache key from three fields:

```js
SHA256(JSON.stringify({ instruction, url, variableKeys }))
```

The page content is **not part of the key**. `"Click on story title in rank 7"` on `https://news.ycombinator.com/news` always produces the same hash, regardless of which article is currently at rank 7. This is a deliberate design choice: the cache encodes intent ("click rank 7"), not identity ("click this specific link").

The cached file stores a Playwright xpath selector and a human-readable `description` of the element the LLM resolved at recording time. On replay, Stagehand executes the xpath directly. The xpath is positional — it points to a specific row in the table regardless of what content is in that row.

One gotcha worth noting: `description` is filled with the element's visible text at recording time (e.g., `"link: A Periodic Map of Cheese"`). If self-heal is enabled and the page content has changed, the LLM will search for text that no longer exists at the expected position — with the risk of finding that article somewhere else on the page and clicking it silently. This is the reason self-heal is disabled in the benchmark.

### Browser Use — cache per run (or per step)

Browser Use takes a different approach. It records the **entire agent session** as an `AgentHistoryList` JSON — every step, every interacted element, every model output — and replays it via `agent.rerun_history()`.

The interesting part is how it finds elements on replay. For each recorded action, it runs a **5-level cascade** to match the historical element against the live DOM:

| Level | Strategy | Breaks if... |
|---|---|---|
| 1 — EXACT | Hash of tag path + static attributes + visible text | Text or structure changes |
| 2 — STABLE | Same hash but dynamic CSS classes stripped | Text still changes |
| 3 — XPATH | Absolute positional path (`tr[10]/td[3]/...`) | DOM structure shifts |
| 4 — AX_NAME | Tag + accessibility name, position-independent | Element disappears entirely |
| 5 — ATTRIBUTE | `name`, `id`, or `aria-label` value | Attributes change |

If all five levels fail, the action is **dropped silently** — no exception is raised, no LLM fallback is triggered. The run is reported as successful even if work was skipped.

The critical detail is in levels 1 and 2: both include `ax_name` (the element's visible text) in the hash. If a story title changes — even if the link is at the same position in the table — levels 1 and 2 both fail and the match falls through to level 3 (positional xpath). Level 3 will typically still find *an* element at that position, but it's the element currently occupying that row, not the one originally recorded. The replay proceeds and reports success.

---

## Results

### Run correctness

| Run | Stagehand (oss-20b) | BU agent (oss-120b) | BU act (oss-20b) | BU act (oss-120b) |
|---|---|---|---|---|
| 1st run | ✅ | ✅ | ✅ | ✅ |
| 2nd run | ✅ | ✅ cached | ✅ cached | ✅ cached |
| 3rd run | ✅ | ✅ cached | ✅ cached | ✅ cached |
| 1st re-run after content change | ✅ | ❌ reopened old content | ❌ reopened old content | ❌ reopened old content |
| 2nd re-run after content change | ✅ | ❌ | ❌ | ❌ |
| 3rd re-run after content change | ✅ | ❌ | ❌ | ❌ |

For completeness: `llama-4-scout` failed on the first run entirely for both libraries. Stagehand couldn't get valid structured JSON responses from it; Browser Use agent fell into a loop. Neither was stable enough to include in the caching analysis.

### Token consumption

| | Stagehand (oss-20b) | BU agent (oss-120b) | BU act (oss-20b) |
|---|---|---|---|
| 1st run | 131,521 in / 5,422 out | 283,679 in / 19,573 out | 273,805 in / 21,687 out |
| 2nd / 3rd run | **0** (10 cache hits) | **0** (1 cache hit) | **0** (22 cache hits) |
| 1st re-run after content change | 41,636 in / 1,441 out (+ 9 hits) | ❌ wrong result | ❌ wrong result |

---

## Why the results look the way they do

### Stagehand handles content changes cleanly

The cache key doesn't include page content, so `"Click on story title in rank 7"` is a valid cache hit even after the article list rotates. The xpath selector is positional — it points to row 7 of the table regardless of what's in it. As long as the DOM structure of HN doesn't change (it hasn't for years), the selector stays valid. On the first re-run after content change, 9 of 10 steps hit cache and only 1 required a new LLM call (~41K tokens vs the original 131K). That 1 miss was for a story that had shifted far enough in the list that the cached xpath pointed to a different position.

### Browser Use fails on content change — silently

When articles shift positions, levels 1 and 2 fail immediately because `ax_name` (the title text) has changed. Level 3 (xpath) then matches the element *currently at that position*, which may be a completely different article. Level 4 (accessibility name) could find the original article at its new position — but that would be the wrong behavior for a positional task. Either way, the replay proceeds and reports success. In the benchmark this produced the observed outcome: old articles re-opened at their new positions, with no indication in the output that anything was wrong.

### Browser Use agent needs a larger model

In agent mode, the entire task runs inside a single growing context. Each step adds history, DOM snapshots, and prior results to the prompt. With `oss-20b` this caused the agent to loop, reopening the same links repeatedly. The context window filled with prior actions but the model couldn't track completion state reliably. Switching to `oss-120b` resolved it.

### The act-equivalent brings the model requirement down but not the token count

Breaking the task into single-step agents with `max_steps=2` removes the cumulative context problem — each agent handles one instruction and terminates. This brings the minimum viable model back to `oss-20b`, matching Stagehand. But token usage stays high (~273K) because each agent instance still initializes with a full system prompt and DOM snapshot. There are no native structured-output primitives like Stagehand's `act()`, so per-step overhead is substantially larger.

---

## When to use which

**Use Stagehand if:**
- You're on a TypeScript/Node.js stack
- Your target pages have dynamic content (rotating articles, user-specific data, real-time updates)
- You want to control each step explicitly and mix natural language instructions with direct Playwright calls
- Minimizing model size and token cost matters — `oss-20b` is sufficient

**Use Browser Use (agent mode) if:**
- You're on Python
- Your target is structurally and content-stable between runs (e.g., internal tools, admin panels, forms with predictable state)
- You prefer describing the full task in prose rather than decomposing it manually
- You're willing to use a larger model (`oss-120b`) for reliable execution

**Use Browser Use (act-equivalent) if:**
- You want the step-by-step pattern in Python
- Be aware the caching limitations are identical to agent mode — this only helps with model requirements, not cache correctness

**Neither** is production-ready out of the box for targets where DOM structure or content changes between runs without an explicit invalidation strategy. Both require application-level logic to detect stale results and regenerate the cache when needed.

---

## Tool comparison

| | Stagehand | BU agent | BU act-equivalent |
|---|---|---|---|
| Minimum viable model | oss-20b | oss-120b | oss-20b |
| Cache granularity | Per instruction | Entire run | Per step |
| Cache key includes page content | ❌ | ✅ (via element hash) | ✅ (via element hash) |
| Handles content changes correctly | ✅ | ❌ silent wrong result | ❌ silent wrong result |
| Fallback on broken selector | Self-heal (opt-in LLM call) | None — action skipped silently | None — action skipped silently |
| Token usage — 1st run | ~137K total | ~303K total | ~295K total |
| Token usage — cached runs (valid) | 0 (10 cache hits) | 0 (1 cache hit) — ⚠️ wrong result after content change | 0 (22 cache hits) — ⚠️ wrong result after content change |
| Ecosystem | TypeScript / Node.js | Python | Python |

---

## Try it yourself

The full benchmark code is available at ([→ repo link](https://github.com/danipisca07/ai-agent-scrapers)). The repository includes all three implementations described in this article, a `compare.py` script that reads the JSON output files and prints a summary table, and clear instructions on how to replace the example task with your own.

To adapt it to your use case, you only need to edit one function in each script — `make_task()` in the Python files and the marked block in `index.ts`. Swap in your target URL and your sequence of instructions, run the scripts across the same configurations, and `compare.py` will give you the same breakdown of LLM calls, token consumption, and cache hits for your specific scenario. 

You find everything in the README inside the repository.
Or, if you'd rather delegate this part too: copy the prompt, hand it to Claude Code, and go make yourself a coffee.

```
Clone the repository at https://github.com/danipisca07/ai-agent-scrapers locally.

Read the README.md in the root of the repo carefully before doing anything else.

Then ask me the following questions, one at a time, and wait for my answer before proceeding:

1. Which library do you want to test? (Stagehand, Browser Use agent mode, Browser Use act-equivalent, or all three)
2. What is the target URL you want to automate?
3. Describe step by step what the script should do on that page (e.g. "click the first 5 product links and go back each time").
4. Which model do you want to use? (default: openai/gpt-oss-20b)
5. How many consecutive runs do you want to execute to evaluate caching? (default: 3)

Once I have answered all questions:

- For Stagehand: edit the marked block in stagehand/index.ts (the comment says "Change the code below to run your own script") to implement the task I described. Keep the existing token tracking and cache invalidation logic untouched.
- For Browser Use agent mode: edit the make_task() function in browser_use/scraper-agent.py to produce the correct task string for my use case.
- For Browser Use act-equivalent: edit the make_task() function in browser_use/scraper.py in the same way.

Set up the required .env files for each library I want to test, following the .env.example files in each subdirectory. Ask me for any API keys you need.

Then run the selected scripts with the configured number of runs, and finally run compare.py to show me the results summary.

Do not write any code until you have all the answers. Proceed one phase at a time and ask me for confirmation before each one.
```