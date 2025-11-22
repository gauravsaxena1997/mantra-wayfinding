
import { Type } from '@google/genai';

// SIMPLIFIED SCHEMA - Gemini has constraints on schema complexity
// We keep detailed instructions in prompts.ts, but use simple schema here
export const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        spec_id: { type: Type.STRING },
        mode: { type: Type.STRING, enum: ["AUTO", "JSON_TO_IMAGE"] },
        quote: {
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING } },
            required: ["text"]
        },
        metadata: {
            type: Type.OBJECT,
            properties: {
                author: { type: Type.STRING },
                source: { type: Type.STRING }
            },
            required: ["author", "source"]
        },

        // OPTIONAL: JSON strings - AI generates valid JSON, we validate it
        // Must be properly escaped JSON strings
        jsonImagePrompt: {
            type: Type.STRING,
            description: "A valid JSON string (2000+ words) containing all image generation details. MUST be properly escaped JSON that can be parsed. OPTIONAL - only generate if user requests.",
            nullable: true
        },

        jsonVideoPrompt: {
            type: Type.STRING,
            description: "A valid JSON string containing all video generation details. MUST be properly escaped JSON that can be parsed. OPTIONAL - only generate if user requests.",
            nullable: true
        },

        caption: {
            type: Type.OBJECT,
            description: "Structured caption for social media. OPTIONAL - only generate if user requests.",
            nullable: true,
            properties: {
                quote: { type: Type.STRING },
                author: { type: Type.STRING },
                source: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["quote", "author", "source", "description", "hashtags"]
        },

        altText: {
            type: Type.STRING,
            description: "Accessibility text description. OPTIONAL - only generate if user requests.",
            nullable: true
        },

        technical_specs: {
            type: Type.OBJECT,
            properties: {
                aspect_ratio: { type: Type.STRING },
                resolution: { type: Type.STRING }
            },
            required: ["aspect_ratio", "resolution"]
        }
    },
    // Only core fields are required; optional outputs (jsonImagePrompt, jsonVideoPrompt, caption, altText) are nullable
    required: ["spec_id", "mode", "quote", "metadata", "technical_specs"]
};
