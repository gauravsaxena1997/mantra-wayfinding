
# Mantra Wayfinding: Project README

## 1. Project Overview

Mantra Wayfinding is an automated content creation tool designed to produce high-quality, ready-to-post Instagram motivational quote assets. Its core purpose is to streamline the creative process by generating a complete package: a photorealistic image with an integrated quote, a well-crafted caption, relevant hashtags, accessibility alt text, AND detailed specs for Text-to-Image and Image-to-Video generation.

The application leverages a sophisticated multi-step AI pipeline using **Google Gemini 2.5 Flash** and **Gemini 2.5 Flash Image** to ensure speed and availability while maintaining high adherence to physical integration instructions.

---

## 2. Core Features

-   **Multi-Mode Operation**:
    -   **AUTO**: The AI has full creative freedom to select a verified quote, design a scene, and generate a complete asset from scratch, ensuring variety.
    -   **MANUAL**: The user provides a specific quote, author, and source, and the AI builds the visual asset around that theme.
    -   **JSON**: Advanced users can provide a complete JSON `spec` object for precise, repeatable control over the output.
-   **Tri-Output Generation**:
    1.  **Final Image**: The composited visual asset.
    2.  **Text-to-Image Spec**: A JSON object optimized for high-quality image generation models.
    3.  **Image-to-Video Spec**: A JSON object describing camera motion and physics for converting the image into a video using tools like Veo.
-   **3-Stage Generation Pipeline**: A robust process that separates creative direction (spec generation) from asset creation (background -> composition) for superior results.
-   **Strict Quality Control**: The entire system is governed by a set of non-negotiable `strict_guidelines` to ensure all outputs are brand-safe, aesthetically consistent, and highly legible.
-   **Hyper-Realistic Text Integration**: The pipeline is optimized to make the quote appear naturally part of the scene (e.g., carved, painted, projected) rather than a simple text overlay.

---

## 3. The 3-Step Generation Pipeline

The application's logic is built on a 3-step pipeline that uses the JSON `spec` object as the central blueprint.

### Step 1: Specification Generation (The "Blueprint")
-   **Model**: `gemini-2.5-flash`
-   **Process**: Based on the user's selected mode (`AUTO` or `MANUAL`), the application sends a request to the Gemini model to generate a JSON structure outlining the scene, lighting, surface materials, and typography.

### Step 2: Background Image Generation (The "Canvas")
-   **Model**: `gemini-2.5-flash-image`
-   **Process**: The system generates a high-resolution base image based on the `spec`. This image is strictly text-free to serve as the perfect substrate for the next step.

### Step 3: Realistic Text Composition (The "Final Art")
-   **Model**: `gemini-2.5-flash-image`
-   **Process**: The background image is fed back into the model with a complex prompt that enforces:
    -   **Physical Integration**: Text must look carved, painted, or illuminated within the scene physics.
    -   **30% Viewport Coverage**: Text must be bold and dominant.
    -   **Visibility**: No obstructions or low-contrast placement.
-   **Output**: The final ready-to-use image.

---

## 4. Quality Control Framework

### Strict Guidelines

**1. Quote Integrity**
- Copy the quote text **exactly** as provided, character-for-character.
- No paraphrasing, shortening, or adding emojis.
- No changes to punctuation or capitalization.

**2. Allowed Visible Text**
- The ONLY readable text is the **quote text** and the watermark **"@mantra.wayfinding"**.
- Both must be on the SAME physical surface.
- Never place the watermark floating in an empty corner.

**3. No Other Text**
- **NO AUTHOR NAME** or source on the image.
- No logos, signs, UI text, or graffiti.
- Any background text must be illegible.

**4. Typography Style**
- Style matches the medium (e.g., carved in sand, painted on wall).
- **Readability > Decoration**.
- Clear separation, even strokes, no extreme distortion.

**5. Layout & Contrast**
- Single, well-defined text block.
- Strong contrast with background.
- No busy patterns behind letters.

**6. Negative Requirements**
- No misspellings or broken letters.
- No fisheye or melting geometry.

---

## 5. JSON Data Structure

The application produces a structured JSON object with the following high-level keys:
-   `image_spec`: Describes the visual scene, typography, and surface details.
-   `video_spec`: Describes camera motion, duration, and environmental dynamics.
-   `caption`: Ready-to-post social media caption.
-   `metadata`: Author and source information.
