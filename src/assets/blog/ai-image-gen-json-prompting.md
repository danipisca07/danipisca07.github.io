# How to stop playing prompt roulette with AI image generation and actually get what you want

This is the “no theory, just show me how” part of the series. Here you’ll see exactly how to upload an image, ask the AI to describe it in JSON, tweak only the parts you care about, and then run precise edits without playing prompt roulette.

<figure>
  <img src="assets/blog/images/ai-image-gen-json-prompting.png" alt="Starting image">
  <figcaption>Understand how AI see things</figcaption>
</figure>

If you landed here first and want more context about why this structured approach matters (and whether it’s worth the extra AI call), you can start with [Part 1 on Medium](https://medium.com/p/de55b534ae12).

## Walkthrough: Complex Multi-Edit in a Single Pass

To demonstrate the power—and the limits—of structured JSON prompting, we will test it on a complex urban scene with multiple pedestrians, background text, and reflections.

The goal is to perform four distinct modifications at once. Instead of writing one massive, chaotic natural-language prompt and hoping for the best, we will use the JSON workflow to neatly compartmentalize each instruction.

<figure>
  <img src="assets/blog/images/json-prompting-source.jpg" alt="Starting image">
  <figcaption>The source image used for the walkthrough.</figcaption>
</figure>

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

The model will return a highly detailed JSON map of the image. You will notice how it cleanly separates subjects (like `person_central_real` and `person_left_real`) as well as environmental factors.

[See original json](files/json-prompting-edit-prompt-source.json)

If want to see other prompt examples to use for the generation of json that highlights other details in a photo, make sure to read the article to the end!


### Step 2: Injecting the Edits

Rather than writing a new prompt from scratch, take the generated JSON and add a new `"change"` field specifically into the blocks you want to modify.

For this test, we are requesting four targeted changes:

1. **Object addition:** Add a black umbrella to the person on the far left.
2. **Subject removal:** Completely remove the person in the dark sweater from the midground.
3. **Object repositioning:** Move the shopping bags from the central person's left hand to their right hand.
4. **Text replacement:** Change the text on the central red-and-white background sign to "danipisca07".

Here is the modified JSON containing the injected `"change"` instructions:

<figure>
  <img src="assets/blog/images/json-prompt-compare.png" alt="Changes to json">
  <figcaption>The original JSON (left) vs. the edited JSON with injected change fields (right).</figcaption>
</figure>

[See full edited json](files/json-prompting-edit-prompt-edit.json)

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

<figure>
  <img src="assets/blog/images/json-prompting-output.jpg" alt="Result image">
  <figcaption>The final output after applying the four targeted edits in a single pass.</figcaption>
</figure>

**What worked:**

* **Text replacement:** The sign text changed to "danipisca07" flawlessly. The model matched the original font, spacing, and perspective perfectly without spelling errors.
* **Object addition:** A black umbrella was successfully placed in the hand of the person on the far left.
* **Subject removal:** The midground person was cleanly erased, and the background was reconstructed naturally.

**What failed:**

* **Object repositioning:** The model failed to switch the shopping bags from the central person's left hand to the right hand.

**The Takeaway:**
Achieving three out of four complex, targeted edits in a single run—especially a perfect text replacement and a clean subject removal—is highly impressive for AI image generation.

More importantly, the structured JSON approach prevented the model from "hallucinating" or accidentally altering the lighting, the reflective glass, or the other unedited pedestrians. The fact that one spatial edit failed shows that the method still has limits with complex spatial reasoning, but it also highlights the core strength of the workflow: because the edits are modular and structured, you can simply tweak the instruction for the shopping bags and run a second pass without risking the rest of the image falling apart.

## Extra examples

Here are four common scenarios and the exact prompts to use for step one.
### 1. Product Integration \& Background Replacement

**When to use it:** You have a perfect product photo (like a coffee cup or a bottle of perfume) but you want to move it from a boring studio background to a snowy mountain or a modern office.[^1]

**The Prompt:**

```text
Analyze this image and create a detailed JSON description.
Crucially, separate the main product from its environment.

Include these specific blocks:
- "hero_product": Detail the shape, branding, color, and material of the main item.
- "product_lighting": Describe how light hits the product, including highlights and shadows.
- "environment": Describe the background, floor, and surrounding scene.
- "contact_points": Detail where the product touches the ground (e.g., reflections, cast shadows).
- "unchangeable_elements": List the product's core identity and logo.

Return only valid JSON.
```

**How to edit it:** Leave the `"hero_product"` block completely alone. Rewrite the `"environment"` block to describe your new scene, and tweak `"product_lighting"` slightly so it matches the new environment.

### 2. Style \& Material Transfer

**When to use it:** You want to keep the exact composition of a photo but change what things are made of—like turning a real photograph of a wooden chair into a 3D glass render, or a watercolor painting.[^2]

**The Prompt:**

```text
Analyze this image and create a detailed JSON description focusing on geometry versus material.

Include these specific blocks:
- "base_geometry": Describe the structural shapes, outlines, and physical layout of the subjects. This must be preserved.
- "surface_materials": Describe what things appear to be made of (e.g., wood, fabric, skin).
- "textures": Describe the tactile feel (e.g., rough, glossy, matte).
- "art_style": Describe the current medium (e.g., photorealistic, digital art, sketch).
- "color_palette": List the dominant colors.

Return only valid JSON.
```

**How to edit it:** Keep `"base_geometry"` identical so the shapes don't mutate. Change `"surface_materials"`, `"textures"`, and `"art_style"` to achieve your new look.

### 3. Detailed Character Control (Faces \& Expressions)

**When to use it:** You have a generated character whose face and identity are perfect, but you need them to look angry, smile, or look in a different direction.

**The Prompt:**

```text
Analyze this image and create a detailed JSON description of the person's face and posture.

Include these specific blocks:
- "facial_structure": Detail the bone structure, age, ethnicity, and permanent features (scars, freckles).
- "current_expression": Describe the emotion and exact muscle movements (e.g., slightly parted lips, furrowed brows).
- "eye_direction": Detail exactly where the subject is looking.
- "head_tilt": Describe the angle of the head relative to the camera.
- "unchangeable_identity": A strict list of features that must remain identical to preserve the character's likeness.

Return only valid JSON.
```

**How to edit it:** Lock down the `"facial_structure"` and `"unchangeable_identity"` fields. Edit only the `"current_expression"` or `"eye_direction"` field to change the emotion without losing the character.

### 4. The Advanced Merge: Combining Two Images

**When to use it:** You want to take a subject from Image A (e.g., a person) and place them seamlessly into Image B (e.g., a specific room), and you want them to actually interact with the environment, not just look like a sticker.

**Step 1:** Upload Image A (The Subject) and run this prompt:

```text
Analyze this image and extract the main subject into a JSON block named "source_subject".
Detail their posture, clothing, proportions, and identity. 
Return only this JSON block.
```

**Step 2:** Upload Image B (The Background) and run this prompt:

```text
Analyze this image and extract the environment into a JSON block named "target_environment".
Detail the lighting direction, depth of field, background objects, and mood.
Return only this JSON block.
```

**Step 3:** Combine both JSON blocks into a single file and add a new `"blend_instructions"` block. Tell the AI how they should interact.

**The Execution Prompt:**

```text
I have attached two images (Image A and Image B) and a single JSON file.
Using the JSON as your absolute source of truth:
1. Recreate the "source_subject" (from Image A).
2. Reconstruct the "target_environment" (from Image B).
3. Follow the "blend_instructions" to seamlessly merge the subject into the environment, ensuring lighting and shadows match.
```