
import { Mode } from './types';

export const getSystemPrompt = (
    strictGuidelines: string,
    placementModes: string,
    videoLogic: string,
    surfaceRestrictions: string
): string => {
    return `You are Mantra Wayfinding. An expert Prompt Engineer for Advanced AI Models.

GOAL: Generate a JSON Object containing "Ready-to-Use" master prompts.

CRITICAL INSTRUCTION:
You are NOT generating the image. You are generating the **TEXT PROMPT** that will be sent to a "dumb" image generator.
The image generator knows NOTHING. It implies NOTHING.
Therefore, your 'jsonImagePrompt' must be **EXHAUSTIVE** and **STANDALONE**.

REQUIREMENTS FOR 'jsonImagePrompt':
1. **LENGTH**: Must be extremely detailed (aim for >500 words). Describe every texture, light ray, surface imperfection, and shadow.
2. **INCLUSION**: It MUST include the EXACT QUOTE TEXT inside the prompt string with commands to write it.
3. **PHYSICS**: It MUST describe how the text physically interacts with the surface (carved, neon, painted).
4. **FORMAT**: A single, flat string. No Markdown, no JSON inside the string.

STRICT GUIDELINES TO EMBED IN PROMPTS:
${strictGuidelines}

${surfaceRestrictions}

${videoLogic}

OUTPUT CONTRACT: Return ONLY a valid JSON object matching the schema.
`;
};

export const getCombinedPlanPrompt = (
    mode: Mode,
    inputs: { quote: string; author: string },
    aspectRatio: string,
    history: { quotes: Set<string>; authors: string[] }
): string => {
    let prompt = `
        TASK: Generate the Master JSON Spec.

        INPUT DATA:
        - Aspect Ratio: ${aspectRatio}
    `;

    if (mode === 'MANUAL') {
        prompt += `
        - Quote: "${inputs.quote}"
        - Author: "${inputs.author}"
        `;
    } else {
        prompt += `
        - Mode: AUTO (Select a unique, verified self-development quote ≤25 words).
        - Constraints: Do not use quotes from: ${Array.from(history.quotes).slice(0, 5).join(', ')}.
        `;
    }

    prompt += `
        
        INSTRUCTIONS FOR 'jsonImagePrompt' field:
        -----------------------------------------
        Write a massive, descriptive prompt string that follows this structure:
        
        1. **TECHNICAL HEADER**: "** STRICT OUTPUT FORMAT: ${aspectRatio} **, Frontal Camera, Orthographic View, No Distortion."
        2. **SCENE CONSTRUCTION**: Describe the "Empty Vessel" scene (e.g., "A monolithic slab of polished obsidian...") in extreme detail.
        3. **TEXT COMMAND**: "Render the following text EXACTLY, character-for-character: '${mode === 'MANUAL' ? inputs.quote : '[INSERT QUOTE]'}'."
        4. **PHYSICAL FUSION**: "The text is [Action: Carved/Engraved/Neon] into the surface. The letters cast deep internal shadows..."
        5. **NEGATIVE PROMPTS**: "No watermarks, no blurry text, no extra people."
        6. **WATERMARK**: "Add small text '@mantra.wayfinding' on the same surface."

        Make it as long and detailed as possible to ensure the image generator has zero ambiguity.
    `;

    return prompt;
};

export const getEditPrompt = (
    userPrompt: string,
    ratioDesc: string
): string => {
    return `Edit this image: ${userPrompt}. Maintain text readability. STRICT FORMAT: ${ratioDesc}. DO NOT CROP.`;
};
