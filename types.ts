
import { Type } from '@google/genai';

export type Mode = 'AUTO' | 'JSON_TO_IMAGE';
export type Page = 'generate' | 'saved';
export type Theme = 'light' | 'dark';

export interface SavedAsset {
  id: string;
  imageDataUrl: string;
  spec: AssetSpec;
  formattedCaption: string;
  timestamp: number;
}

// === STRUCTURED CAPTION ===
export interface Caption {
    quote: string;
    author: string;
    source: string;
    description: string;
    hashtags: string[];
}

// === ASSET SPECIFICATION ===
// Note: jsonImagePrompt and jsonVideoPrompt are JSON strings
// They contain comprehensive structured data but are returned as strings
// to avoid Gemini's schema complexity limits
export interface AssetSpec {
    spec_id: string;
    mode: string;
    quote: { text: string };
    metadata: { author: string; source: string };

    // OPTIONAL: These come from AI as objects, we stringify them in pipeline
    // Stored as strings for consistency with image API requirements
    jsonImagePrompt?: string | null;  // Stringified JSON object
    jsonVideoPrompt?: string | null;  // Stringified JSON object

    // OPTIONAL STRUCTURED CAPTION OBJECT
    caption?: Caption | null;

    // OPTIONAL: Only generated when caption is requested
    altText?: string | null;

    // Technical metadata
    technical_specs: {
        aspect_ratio: string;
        resolution: string;
    };
}

// Type helper for when we parse the JSON strings
export type ParsedImagePrompt = any; // The parsed JSON structure
export type ParsedVideoPrompt = any; // The parsed JSON structure
