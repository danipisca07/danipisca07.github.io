<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## Walkthrough: Complex Multi-Edit in a Single Pass

To demonstrate the power—and the limits—of structured JSON prompting, we will test it on a complex urban scene with multiple pedestrians, background text, and reflections.

The goal is to perform four distinct modifications at once. Instead of writing one massive, chaotic natural-language prompt and hoping for the best, we will use the JSON workflow to neatly compartmentalize each instruction.

[INSERT ORIGINAL IMAGE HERE]

### Step 1: Generating the Baseline JSON

First, you need the AI to map out the image into a JSON structure, capturing each pedestrian and significant background element as a separate data point.

Upload your source image to your AI image generator and use this exact prompt:

```text
Analyze this image and create a very detailed JSON description of everything that is visible.

Focus especially on the people in the image. For each person, create a separate object with:
- a stable identifier
- position in the image
- clothing
- pose or action
- visible expression
- easy recognition details

Also describe:
- background
- lighting
- mood
- objects in the scene
- elements that should remain unchanged unless explicitly edited

Be specific and visually descriptive. Do not generate a new image. Only return the JSON.
```

The model will return a highly detailed JSON map of the image. You will notice how it cleanly separates subjects (like `personcentralreal` and `personleftreal`) as well as environmental factors.

[INSERT ORIGINAL JSON HERE]

### Step 2: Injecting the Edits

Rather than writing a new prompt from scratch, take the generated JSON and add a new `"change"` field specifically into the blocks you want to modify.

For this test, we are requesting four targeted changes:

1. **Object addition:** Add a black umbrella to the person on the far left.
2. **Subject removal:** Completely remove the person in the dark sweater from the midground.
3. **Object repositioning:** Move the shopping bags from the central person's left hand to their right hand.
4. **Text replacement:** Change the text on the central red-and-white background sign to "danipisca07".

Here is the modified JSON containing the injected `"change"` instructions:

[INSERT EDITED JSON HERE]

### Step 3: Running the Edit

Now, pass the original image back to the model, alongside your newly edited JSON. This serves as the blueprint for the generation.

Use this execution prompt:

```text
Edit the original image using the attached JSON as the source of truth.
I have added "change" fields to the original description, this are all and only changes that you need to do.
Preserve all details that are not explicitly changed in the JSON.
Apply only the modifications described in the edited fields.
Keep the same composition, scene structure, and background unless the JSON explicitly says otherwise.
```


### Step 4: The Result

[INSERT EDITED IMAGE HERE]

**What worked:**

* **Text replacement:** The sign text changed to "danipisca07" flawlessly. The model matched the original font, spacing, and perspective perfectly without spelling errors.
* **Object addition:** A black umbrella was successfully placed in the hand of the person on the far left.
* **Subject removal:** The midground person was cleanly erased, and the background was reconstructed naturally.

**What failed:**

* **Object repositioning:** The model failed to switch the shopping bags from the central person's left hand to the right hand.

**The Takeaway:**
Achieving three out of four complex, targeted edits in a single run—especially a perfect text replacement and a clean subject removal—is highly impressive for AI image generation.

More importantly, the structured JSON approach prevented the model from "hallucinating" or accidentally altering the lighting, the reflective glass, or the other unedited pedestrians. The fact that one spatial edit failed shows that the method still has limits with complex spatial reasoning, but it also highlights the core strength of the workflow: because the edits are modular and structured, you can simply tweak the instruction for the shopping bags and run a second pass without risking the rest of the image falling apart.

