# Mantra Wayfinding: Image Generation Guide

This document provides a comprehensive guide to the image generation process for the Mantra Wayfinding application. It covers the core principles, prompt structure, layout rules, and the detailed JSON specification that drives the asset creation.

## 1. Core Principles

The generator operates on a set of non-negotiable principles to ensure high-quality, brand-safe, and effective content.

-   **Readability Above All**: The quote is the hero of the image. Its legibility is the primary goal, overriding other aesthetic considerations if they conflict. The text must be instantly and effortlessly readable.
-   **Realistic Integration**: The quote should appear naturally integrated into the scene on a physical surface, respecting the laws of perspective.
-   **Aesthetic Consistency**: All generated images should have a clean, modern, and photorealistic feel.
-   **Brand Safety**: No logos, recognizable brands, celebrities, political symbols, or sensitive content is ever permitted.
-   **No Distractions**: The only readable text in the image is the quote and a subtle watermark. Any other text in the scene (e.g., on signs, books) must be illegible.

---

## 2. Image Generation Rules & Prompting

The generation process is multi-step, starting with the creation of a "spec" and then using that spec to generate a blank background image.

### Background Image Prompt Template

The prompt to generate the background image (`imagen-4.0-generate-001`) follows a consistent template with strict rules to ensure readability:

`"Photorealistic {vibe} {scene} featuring a clear {placement.mode} sized for a 3:4 poster area. Lighting: {lighting}. Weather/mood: {weather}. People: {people} (no identifiable faces)."`

Each variable is filled in from the generated JSON `spec`:

-   `{vibe}`: The overall mood or feeling. (e.g., "serene," "minimalist," "dramatic," "inspirational")
-   `{scene}`: The environment or setting. (e.g., "a quiet library corner," "a misty mountain path," "an architect's desk")
-   `{placement.mode}`: The specific surface where the text will be placed. This should be a clean, relatively flat surface. (e.g., "piece of high-quality paper," "smooth concrete wall," "frosted glass pane")
-   `{lighting}`: The lighting conditions of the scene. (e.g., "soft morning light," "dramatic sunset," "bright studio lighting")
-   `{weather}`: The atmospheric conditions. (e.g., "calm," "rainy," "overcast," "sunny")
-   `{people}`: Describes the presence of humans. Faces must never be identifiable. (e.g., "none," "a single person out of focus in the background")

**Strict Rules for Readability**:
-   The model is instructed to render the placement surface as **flat, well-lit, and mostly front-facing**.
-   A crucial constraint is that the surface **must not be angled more than 45 degrees** relative to the camera, preventing extreme perspectives that make text hard to read.
-   The model must return this background image with the designated surface left **BLANK**, ready for the text composition step.

---

## 3. Layout, Typography & Composition

Once the blank background is generated, a second model (`gemini-2.5-flash-image-preview`) composites the text onto the image.

-   **Aspect Ratio**: All images are generated in a **3:4 aspect ratio (1080x1440px)**, optimized for Instagram posts.
-   **Viewing Angle**: The background image is pre-vetted to have a clear surface at a readable angle, solving legibility issues before text is even applied.
-   **Typography**: A **bold, modern sans-serif font** is used for maximum clarity and contemporary feel.
-   **Legibility Guarantee**: The composition prompt explicitly instructs the model to apply the text as a **crisp, high-contrast graphic overlay**. This ensures the text respects the surface's perspective but is **not negatively affected by the scene's lighting, shadows, or textures.**
-   **Watermark**: A subtle watermark (`@mantra.wayfinding`) is placed in the bottom-right corner of the image.

---

## 4. JSON `spec` Data Structure

This is the central object that defines every aspect of the final generated asset.

```json
{
  "spec_id": "string",
  "mode": "string",
  "alt_text": "string",
  "quote": {
    "text": "string",
    "author": "string",
    "source_book": "string",
    "verified": "boolean"
  },
  "background": {
    "vibe": "string",
    "scene": "string",
    "surface": "string",
    "lighting": "string",
    "weather": "string",
    "people": "string",
    "style": "string",
    "image_prompt": "string"
  },
  "placement": {
    "mode": "string"
  },
  "typography": {
    "watermark_handle": "string"
  },
  "caption": "string",
  "hashtags": ["string"],
  "notes": "string"
}
```

### Field Descriptions:

-   `spec_id`: A unique identifier for the generation request.
-   `mode`: The operating mode used ("AUTO", "MANUAL", "JSON").
-   `alt_text`: A descriptive text for accessibility (screen readers).
-   `quote`:
    -   `text`: The motivational quote text (max 25 words).
    -   `author`: The author of the quote.
    -   `source_book`: The book or source of the quote.
    -   `verified`: A boolean indicating if the attribution is confirmed.
-   `background`: Contains all elements for building the background image prompt.
    -   `vibe`, `scene`, `lighting`, etc.: See Section 2 for descriptions.
    -   `image_prompt`: The final, complete prompt string sent to the image generation model.
-   `placement`:
    -   `mode`: The type of surface for the text (e.g., "on a weathered wooden sign," "printed on a coffee mug").
-   `typography`:
    -   `watermark_handle`: The text for the watermark.
-   `caption`: The main text to be used in the Instagram post caption.
-   `hashtags`: An array of 6-8 relevant hashtags.
-   `notes`: Internal notes from the model about its choices or any changes it made (e.g., swapping an unverified quote).