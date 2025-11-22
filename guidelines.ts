
/**
 * GLOBAL RULES (STRICT)
 * These guidelines are injected into the system prompt to ensure quality and safety.
 */
export const STRICT_GUIDELINES = `
TYPOGRAPHY & MEDIUM RULES (MANDATORY & AGGRESSIVE)

1. Quote Integrity
- Copy the quote text exactly as provided, character-for-character.
- Do NOT paraphrase, shorten, rephrase, translate, or add emojis.
- Do NOT change punctuation or capitalization.
- If you cannot render the text clearly and correctly, leave the text area BLANK.

2. Allowed Visible Text
- The ONLY readable text in the image or video is:
  (a) the quote text, and
  (b) a small watermark: "@mantra.wayfinding".
- Both the quote and the watermark must be on the SAME physical surface.
- Never place the watermark floating in an empty corner of the frame.

3. No Other Text
- Never show the author name or source book title on the image.
- No other readable text is allowed: no logos, brands, shop signs, etc.

4. Typography Style
- The visual style of the letters should match the physical medium.
- **Readability > Decoration**.
- Letters must be clearly separated, not fused together.
- Avoid overly ornate calligraphy.

5. Layout & Contrast
- Keep the quote in a single, well-defined text block.
- Strong contrast between text and background.

6. Negative Requirements
- Avoid misspellings, broken or merged letters.
- Avoid fisheye distortion, extreme warping.
`;

export const NO_BORING_SURFACES = `
- **NO BORING SURFACES**: 
  - DO NOT use plain brick walls.
  - DO NOT use plain white paper.
  - DO NOT use standard chalkboards.
  - SUGGEST UNIQUE SURFACES: Brushed Steel, Weathered Driftwood, Frosted Glass, Ancient Stone Tablets, Neon on Brutalist Concrete, Leaves on a Forest Floor, Sand Dunes at Sunset.
`;

export const PLACEMENT_MODES = `
PLACEMENT MODES (image_spec.background.quotePlacement)
- ENGRAVED_ON_STONE_WALL
- PAINTED_ON_BRICK_FACADE
- NEON_SIGN_ON_BUILDING
- PROJECTED_ON_MODERN_ARCHITECTURE
- METAL_PLAQUE_ON_WALL
- LETTERPRESS_ON_THICK_CARDSTOCK
- TYPED_ON_VINTAGE_PAPER
- PAGE_IN_AN_OPEN_BOOK
- HIGH_QUALITY_POSTER_FRAME
- WRITTEN_IN_SAND_ON_BEACH
- CARVED_INTO_SMOOTH_WOOD
- CERAMIC_PRINT_ON_COFFEE_MUG
- ETCHED_INTO_GLASS_PANE
`;

export const VIDEO_LOGIC = `
VIDEO LOGIC
- Assume the image is the first frame.
- Motion must be subtle and cinematic (slow dolly, pan).
- Text and watermark must stay in frame.
`;

export const CAMERA_ANGLES = `
CAMERA ANGLE RESTRICTIONS (STRICT)
- **VIEWING ANGLE**: The camera MUST be positioned FRONTAL / PARALLEL to the text surface.
- **PROHIBITED**:
  - NO LOW ANGLES.
  - NO WORM'S EYE VIEW.
  - NO EXTREME GRAZING ANGLES (text disappearing into distance).
  - NO OBLIQUE ANGLES > 30 degrees.
- **GOAL**: The text should look like a flat scan or a direct poster shot, even if the environment is 3D.
`;
