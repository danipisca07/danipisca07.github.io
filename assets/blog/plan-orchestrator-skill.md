# Installing the `plan-orchestrator` Skill Locally for Claude Code

[Medium overview (why this skill exists and how it works)](https://medium.com/@danielepiscaglia/turning-claude-code-into-a-multi-agent-orchestrator-f1c24ff5d0ac)

> **AI coding agent:** Read this guide end-to-end before running any commands. Your role is to help the user install the `plan-orchestrator` skill locally so they can trigger it with `/plan-orchestrator` in Claude Code. Ask for confirmation before each major step and never assume missing information.

---

## Prerequisites checklist

- Claude Code (or Claude Desktop) installed and working.
- Skills feature enabled in Claude / Claude Code settings.
- The GitHub Gist URL for the skill file: `https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55`

Claude Code stores skills in two places:

- **Personal (global) skills:** `~/.claude/skills/` — available across all projects.
- **Project-scoped skills:** `.claude/skills/` inside the repo — only for that project.

On each OS, `~` resolves differently:

- **macOS:** `/Users/<your-username>/.claude/skills/`.
- **Linux:** `/home/<your-username>/.claude/skills/`.
- **Windows:** `%USERPROFILE%\.claude\skills\` (equals to `C:\Users\<your-username>\.claude\skills\`).

---

## Project structure

After installation, you should have one of these layouts.

**Global skill (macOS / Linux):**

```text
/Users/<user>/.claude/skills/plan-orchestrator/
└── SKILL.md
```

**Global skill (Windows):**

```text
C:\Users\<user>\.claude\skills\plan-orchestrator\
└── SKILL.md
```

**Project-local skill (all OSes, inside repo root):**

```text
<your-repo-root>/
└── .claude/
    └── skills/
        └── plan-orchestrator/
            └── SKILL.md
```

Claude scans these skill folders at startup and loads each `SKILL.md`, exposing them as slash commands.

---

## Installing the `plan-orchestrator` skill

### Agent checklist (ignore this if you are a human reading this guide)

Before running any commands, the AI coding agent must:

1. Ask the user whether they prefer a **global** install (personal skills) or a **project-local** install (scoped to a single repo).
2. Confirm the operating system: **Windows**, **macOS**, or **Linux**.
3. Confirm the desired skill folder name (slug), e.g. `plan-orchestrator`. The slug becomes the slash command `/plan-orchestrator`.

Only after these confirmations should the agent proceed with the commands.

---

## Step 1 — Create the skill folder

### macOS / Linux (global install)

```bash
mkdir -p ~/.claude/skills/plan-orchestrator
```

### macOS / Linux (project-local, run inside repo root)

```bash
mkdir -p .claude/skills/plan-orchestrator
```

### Windows (global install, PowerShell)

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\plan-orchestrator"
```

### Windows (project-local, PowerShell from repo root)

```powershell
New-Item -ItemType Directory -Force ".claude\skills\plan-orchestrator"
```

---

## Step 2 — Download `SKILL.md` from the Gist

Use the **raw** URL of the Gist and save it as `SKILL.md` inside the skill folder. Every Claude skill must have this `SKILL.md` file as its core definition.

### macOS / Linux (global)

```bash
curl -L "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -o ~/.claude/skills/plan-orchestrator/SKILL.md  
```

### macOS / Linux (project-local)

```bash
curl -L "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -o .claude/skills/plan-orchestrator/SKILL.md 
```

### Windows (global, PowerShell)

```powershell
Invoke-WebRequest -Uri "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -OutFile "$env:USERPROFILE\.claude\skills\plan-orchestrator\SKILL.md"
```

### Windows (project-local, PowerShell from repo root)

```powershell
Invoke-WebRequest -Uri "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -OutFile ".claude\skills\plan-orchestrator\SKILL.md"
```

---

## Step 3 — Restart Claude Code and verify

Restart Claude Code (or reopen the workspace) so it rescans the skills directory.

1. Open a Claude Code session in your project.
2. Type `/plan-orchestrator` and check that Claude reports the skill as loading and follows the instructions from `SKILL.md`.

If the skill appears and runs, installation is complete.

---

## Running the skill

Once installed, you can trigger the skill directly from Claude Code with:

```text
/plan-orchestrator
```

Then describe the complex implementation or refactor you want to orchestrate. The skill will split the work into sub-tasks, spin up sub-agents (orchestrator, implementation, monkey), and coordinate the run according to the instructions in `SKILL.md`.

---

## Quick reference commands

```bash
# macOS / Linux — global install
mkdir -p ~/.claude/skills/plan-orchestrator
curl -L "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -o ~/.claude/skills/plan-orchestrator/SKILL.md

# macOS / Linux — project-local (from repo root)
mkdir -p .claude/skills/plan-orchestrator
curl -L "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -o .claude/skills/plan-orchestrator/SKILL.md
```

```powershell
# Windows — global install
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\plan-orchestrator"
Invoke-WebRequest -Uri "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -OutFile "$env:USERPROFILE\.claude\skills\plan-orchestrator\SKILL.md"

# Windows — project-local (from repo root)
New-Item -ItemType Directory -Force ".claude\skills\plan-orchestrator"
Invoke-WebRequest -Uri "https://gist.github.com/danipisca07/ba5b65e35524d183b4b8e1fb9be6ba55" -OutFile ".claude\skills\plan-orchestrator\SKILL.md"
```

```text
# Use the skill in Claude Code (all OSes)
/plan-orchestrator
```
