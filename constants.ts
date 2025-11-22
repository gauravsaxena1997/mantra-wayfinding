
import { Type } from '@google/genai';

export const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        spec_id: { type: Type.STRING },
        mode: { type: Type.STRING, enum: ["AUTO", "MANUAL", "JSON"] },
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
        
        // THE CORE PROMPTS
        jsonImagePrompt: { 
            type: Type.STRING,
            description: "A massive, exhaustive, single-string prompt (>500 words) containing ALL scene details, physics, quote text, and technical constraints."
        },
        jsonVideoPrompt: { 
            type: Type.STRING,
            description: "A detailed prompt for video generation describing motion and physics."
        },
        
        caption: { type: Type.STRING },
        altText: { type: Type.STRING },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
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
    required: ["spec_id", "mode", "quote", "metadata", "jsonImagePrompt", "jsonVideoPrompt", "caption", "altText", "hashtags", "technical_specs"]
};
