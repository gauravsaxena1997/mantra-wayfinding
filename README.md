# Mantra Wayfinding: Project README

## 1. Project Overview

Mantra Wayfinding is an automated content creation tool designed to produce high-quality, ready-to-post Instagram motivational quote assets. Its core purpose is to streamline the creative process by generating a complete package: a photorealistic image with an integrated quote, a well-crafted caption, relevant hashtags, and accessibility alt text.

The application leverages a sophisticated multi-step AI pipeline using the Google Gemini and Imagen APIs to ensure a high degree of creativity, quality, and consistency.

---

## 2. Core Features

-   **Multi-Mode Operation**:
    -   **AUTO**: The AI has full creative freedom to select a verified quote, design a scene, and generate a complete asset from scratch, ensuring variety.
    -   **MANUAL**: The user provides a specific quote, author, and source, and the AI builds the visual asset around that theme.
    -   **JSON**: Advanced users can provide a complete JSON `spec` object for precise, repeatable control over the output.
-   **3-Stage Generation Pipeline**: A robust process that separates creative direction (spec generation) from asset creation (image generation and composition) for superior results.
-   **Strict Quality Control**: The entire system is governed by a set of non-negotiable `strict_guidelines` and a curated `Placement Modes Enum` to ensure all outputs are brand-safe, aesthetically consistent, and highly legible.
-   **Hyper-Realistic Text Integration**: The final composition step focuses on physical simulation, making the quote appear naturally part of the scene (e.g., carved, painted, projected) rather than a simple text overlay.
-   **Persistent Anti-Repetition**: The application uses `localStorage` to remember all generated quotes and the last 10 authors, ensuring that users receive fresh, unique content across sessions and preventing sequential duplicates.
-   **User-Configurable Controls**: The UI provides options to customize the watermark text and placement, which are strictly enforced on the final image.

---

## 3. The 3-Step Generation Pipeline

The application's logic is built on a 3-step pipeline that uses the JSON `spec` object as the central blueprint.

### Step 1: Specification Generation (The "Blueprint")
-   **Model**: `gemini-2.5-flash`
-   **Process**: Based on the user's selected mode (`AUTO` or `MANUAL`), the application sends a request to the Gemini model. This request is dynamically enhanced with a history of previously generated quotes and authors from the user's `localStorage` to enforce anti-repetition rules. The request is governed by the `SYSTEM_PROMPT`, which contains the full list of rules, placement enums, and the required JSON schema.
-   **Output**: The model's sole task is to act as a creative director and return a single, valid JSON `spec` object. This object contains every piece of information needed for the subsequent steps, from the quote text to the detailed image prompt and caption. This is the most critical creative step.

### Step 2: Background Image Generation (The "Canvas")
-   **Model**: `imagen-4.0-generate-001`
-   **Process**: The `background.image_prompt` string is extracted from the newly created JSON `spec` and sent to the Imagen model.
-   **Output**: Imagen generates a high-quality, photorealistic background image in the user-selected aspect ratio (e.g., 3:4, 9:16, 1:1, 16:9). The prompt is engineered to ensure this image contains a clear, well-lit surface that is ready to have text composited onto it.

### Step 3: Realistic Text Composition (The "Final Art")
-   **Model**: `gemini-2.5-flash-image-preview`
-   **Process**: The background image from Step 2 is combined with a new, highly detailed `compositionPrompt`. This prompt is dynamically built using multiple fields from the JSON `spec`, including the `quote.text`, `watermark.text`, `watermark.placement`, `background.fontSuggestion`, and, most importantly, the `strict_guidelines`.
-   **Output**: The image-editing model renders the text onto the background. The prompt strictly forbids "sticker-like" overlays and instead commands the model to simulate a physical process (carving, painting, etc.), respecting the scene's lighting, texture, and perspective to create a seamless, believable final image.

---

## 4. Quality Control Framework

### Strict Guidelines
The generator operates on a set of non-negotiable principles to ensure high-quality, brand-safe, and effective content. These guidelines are included in every generated `spec` to enforce compliance at all stages.

-   **Readability Above All**: The quote is the hero of the image. Its legibility is the primary goal.
-   **Realistic Integration**: The quote should appear naturally integrated into the scene.
-   **Aesthetic Consistency**: All generated images should have a clean, modern, and photorealistic feel.
-   **Brand Safety**: No logos, brands, celebrities, or sensitive content.
-   **No Distractions**: The quote and watermark are the only readable text.
-   **Caption Format**: The final caption must adhere to the standardized multi-line format.

### Placement Modes Enum
To ensure consistency and quality, the AI **must** choose a `quotePlacement` value from the following predefined list.

-   `ENGRAVED_ON_STONE_WALL`
-   `PAINTED_ON_BRICK_FACADE`
-   `NEON_SIGN_ON_BUILDING`
-   `PROJECTED_ON_MODERN_ARCHITECTURE`
-   `METAL_PLAQUE_ON_WALL`
-   `LETTERPRESS_ON_THICK_CARDSTOCK`
-   `TYPED_ON_VINTAGE_PAPER`
-   `PAGE_IN_AN_OPEN_BOOK`
-   `HIGH_QUALITY_POSTER_FRAME`
-   `WRITTEN_IN_SAND_ON_BEACH`
-   `CARVED_INTO_SMOOTH_WOOD`
-   `ARRANGED_WITH_STONES_OR_LEAVES`
-   `CERAMIC_PRINT_ON_COFFEE_MUG`
-   `ETCHED_INTO_GLASS_PANE`
-   `LABEL_ON_MINIMALIST_BOTTLE`

---

## 5. JSON `spec` Data Structure

This is the central object that defines every aspect of the final generated asset. It acts as the "creative blueprint" passed between the generation stages.

### Full `spec` Example

```json
{
  "spec_id": "string",
  "mode": "string",
  "alt_text": "string",
  "quote": {
    "text": "string",
    "author": "string",
    "source_book": "string"
  },
  "background": {
    "vibe": "string",
    "scene": "string",
    "quotePlacement": "string (Value from Placement Modes Enum)",
    "fontSuggestion": "string",
    "lighting": "string",
    "weather": "string",
    "people": "string",
    "style": "string",
    "image_prompt": "string"
  },
  "watermark": {
    "text": "@mantra.wayfinding",
    "font": "Subtle, light, sans-serif",
    "placement": "Bottom - Right"
  },
  "caption": "string (The engaging body text of the caption, ending with a question and the ✨ emoji)",
  "hashtags": [
    "string",
    "string"
  ],
  "notes": "string",
  "strict_guidelines": {
    "readability": "Readability Above All: The quote is the hero of the image. Its legibility is the primary goal, overriding other aesthetic considerations if they conflict. The text must be instantly and effortlessly readable.",
    "integration": "Realistic Integration: The quote should appear naturally integrated into the scene on a physical surface, respecting perspective, lighting, shadows, and texture. It should look physically present, not like a sticker.",
    "aesthetic": "Aesthetic Consistency: All generated images should have a clean, modern, and photorealistic feel.",
    "safety": "Brand Safety: No logos, recognizable brands, celebrities, political symbols, or sensitive content is ever permitted.",
    "distractions": "No Distractions: The only readable text in the image is the quote and a subtle watermark. Any other text in the scene (e.g., on signs, books) must be illegible.",
    "caption_format": "Confirms understanding of the multi-line caption structure: Quote, Author/Source, Blank Line, Caption Body, Blank Line, Hashtags."
  }
}
```

### Field Descriptions

#### Root Level
-   `spec_id`: A unique identifier for the generation request.
-   `mode`: The operating mode used (`"AUTO"`, `"MANUAL"`, `"JSON"`).
-   `alt_text`: A descriptive text for accessibility (screen readers).
-   `caption`: The main body text for the Instagram post, ending with an encouraging question and the ✨ emoji. It should **NOT** include the quote, author, or source.
-   `hashtags`: An array of 6-8 relevant hashtags. Each string **must** begin with a `#`.
-   `notes`: Internal notes from the model about its creative choices or any changes it made.

#### `quote` object
Contains all information about the motivational quote.
-   `text`: The motivational quote text (max 25 words).
-   `author`: The author of the quote.
-   `source_book`: The book or source where the quote originated.

#### `background` object
Contains all elements for building the background image prompt.
-   `vibe`: The overall mood or feeling (e.g., `"serene"`, `"minimalist"`).
-   `scene`: The environment or setting (e.g., `"a quiet library corner"`).
-   `quotePlacement`: The specific surface for the text. **Must be a value from the Placement Modes Enum.**
-   `fontSuggestion`: A text description of the appropriate font style for the scene (e.g., `"Elegant, classic serif font with a letterpress effect"`).
-   `lighting`, `weather`, `people`, `style`: Descriptive elements that add detail and atmosphere to the scene.
-   `image_prompt`: The final, complete prompt string sent to the image generation model (Imagen).

#### `watermark` object
Defines the branding watermark on the final image.
-   `text`: The text for the watermark (e.g., `"@mantra.wayfinding"`).
-   `font`: A description of the watermark's font style (e.g., `"Subtle, light, sans-serif"`).
-   `placement`: The position of the watermark (e.g., `"Bottom - Right"`, `"Top - Left"`).

#### `strict_guidelines` object
An object containing the non-negotiable rules for generation. This is populated by the AI based on the system prompt and is used to enforce quality in the final composition step.
-   `readability`: Confirms understanding that the quote must be instantly and effortlessly readable above all else.
-   `integration`: Confirms understanding that the text must look physically present in the scene (respecting lighting, texture, etc.) and not like a flat sticker.
-   `aesthetic`: Confirms understanding that the final image must be clean, modern, and photorealistic.
-   `safety`: Confirms understanding of brand safety rules (no logos, celebrities, sensitive content, etc.).
-   `distractions`: Confirms understanding that only the quote and watermark should be legible.
-   `caption_format`: Confirms understanding of the multi-line caption structure: `Quote`, `Author/Source`, `Blank Line`, `Caption Body`, `Blank Line`, `Hashtags`.