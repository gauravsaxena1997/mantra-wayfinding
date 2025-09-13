# Mantra Wayfinding: Image Generation Guide

This document provides a comprehensive guide to the image generation process for the Mantra Wayfinding application. It covers the core principles, prompt structure, layout rules, and the detailed JSON specification that drives the asset creation.

## 1. Strict Guidelines

The generator operates on a set of non-negotiable principles to ensure high-quality, brand-safe, and effective content. These guidelines are included in every generated `spec` to enforce compliance at all stages.

-   **Readability Above All**: The quote is the hero of the image. Its legibility is the primary goal, overriding other aesthetic considerations if they conflict. The text must be instantly and effortlessly readable.
-   **Realistic Integration**: The quote should appear naturally integrated into the scene on a physical surface, respecting perspective, lighting, shadows, and texture. It should look physically present, not like a sticker.
-   **Aesthetic Consistency**: All generated images should have a clean, modern, and photorealistic feel.
-   **Brand Safety**: No logos, recognizable brands, celebrities, political symbols, or sensitive content is ever permitted.
-   **No Distractions**: The only readable text in the image is the quote and a subtle watermark. Any other text in the scene (e.g., on signs, books) must be illegible.

---

## 2. Placement Modes Enum

To ensure consistency and quality, the AI **must** choose a `quotePlacement` value from the following predefined list. This defines the surface and context for the quote.

-   `ENGRAVED_ON_STONE_WALL`: The quote is chiseled into a clean, modern stone or concrete wall.
-   `PAINTED_ON_BRICK_FACADE`: The quote is painted as a high-quality mural on an urban brick wall.
-   `NEON_SIGN_ON_BUILDING`: The quote is displayed as a stylish neon sign against a dark or twilight building facade.
-   `PROJECTED_ON_MODERN_ARCHITECTURE`: The quote is projected with light onto a large, minimalist architectural surface at dusk.
-   `METAL_PLAQUE_ON_WALL`: The quote is on a sleek, brushed metal plaque affixed to a wall.
-   `LETTERPRESS_ON_THICK_CARDSTOCK`: The quote is printed with the classic letterpress effect on high-quality, textured paper.
-   `TYPED_ON_VINTAGE_PAPER`: The quote appears on a sheet of aged paper from a vintage typewriter.
-   `PAGE_IN_AN_OPEN_BOOK`: The quote is printed on a page of a beautifully designed, open book.
-   `HIGH_QUALITY_POSTER_FRAME`: The quote is displayed within a minimalist frame, hanging on a wall.
-   `WRITTEN_IN_SAND_ON_BEACH`: The quote is neatly drawn into calm, smooth sand on a beach.
-   `CARVED_INTO_SMOOTH_WOOD`: The quote is elegantly carved into a polished slab of wood or a smooth tree trunk.
-   `ARRANGED_WITH_STONES_OR_LEAVES`: The quote is formed by carefully arranging natural elements like small stones or leaves on a flat surface.
-   `CERAMIC_PRINT_ON_COFFEE_MUG`: The quote is printed cleanly on the side of a minimalist coffee mug.
-   `ETCHED_INTO_GLASS_PANE`: The quote is subtly etched or frosted onto a clean glass window or panel.
-   `LABEL_ON_MINIMALIST_BOTTLE`: The quote is designed as a high-end product label on a simple glass bottle.

---

## 3. Image Generation & Composition

The generation process uses the JSON `spec` to first create a blank background image, then composite the text realistically onto it.

-   **Background Generation**: The `background.image_prompt` is used to generate a 3:4 aspect ratio image with a clear, well-lit, and front-facing surface ready for text. This surface must not be angled more than 45 degrees to the camera.
-   **Realistic Integration & Legibility**: The composition step is critical. The model is instructed to render the quote so that it looks physically part of the scene—**matching the surface's perspective, texture, lighting, and shadows.** This creates a believable effect. However, the rule of **Maximum Readability** still applies; the text must be high-contrast and easy to read despite the realistic integration.
-   **Watermark**: A subtle watermark from `watermark.text` is placed according to the `watermark.placement` value.

---

## 4. JSON `spec` Data Structure

This is the central object that defines every aspect of the final generated asset.

```json
{
  "spec_id": "string",
  "mode": "string",
  "alt_text": "string",
  "quote": { ... },
  "background": { ... },
  "watermark": { ... },
  "caption": "string",
  "hashtags": [ "string" ],
  "notes": "string",
  "strict_guidelines": {
    "readability": "string",
    "integration": "string",
    "aesthetic": "string",
    "safety": "string",
    "distractions": "string"
  }
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
-   `background`: Contains all elements for building the background image prompt.
    -   `vibe`: The overall mood or feeling (e.g., "serene," "minimalist").
    -   `scene`: The environment or setting (e.g., "a quiet library corner").
    -   `quotePlacement`: The specific surface for the text. **Must be a value from the Placement Modes Enum.**
    -   `fontSuggestion`: A text description of the appropriate font style for the scene (e.g., "Elegant, classic serif font with a letterpress effect").
    -   `lighting`, `weather`, `people`, `style`: Descriptive elements for the scene.
    -   `image_prompt`: The final, complete prompt string sent to the image generation model.
-   `watermark`:
    -   `text`: The text for the watermark (e.g., "@mantra.wayfinding").
    -   `font`: A description of the watermark's font style (e.g., "Subtle, light, sans-serif").
    -   `placement`: The position of the watermark (e.g., "Bottom - Right", "Top - Left").
-   `caption`: The main text to be used in the Instagram post caption.
-   `hashtags`: An array of 6-8 relevant hashtags, each string **must** begin with a `#`.
-   `notes`: Internal notes from the model about its choices or any changes it made.
-   `strict_guidelines`: An object containing the non-negotiable rules for generation. This is populated by the AI and used to enforce quality in the final composition step.