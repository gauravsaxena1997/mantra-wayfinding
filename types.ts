
import { Type } from '@google/genai';

export type Mode = 'AUTO' | 'MANUAL' | 'JSON';
export type Page = 'generate' | 'saved';
export type Theme = 'light' | 'dark';

export interface SavedAsset {
  id: string;
  imageDataUrl: string;
  spec: AssetSpec; 
  formattedCaption: string;
  timestamp: number;
}

// Flattened Spec optimized for Direct Passthrough
export interface AssetSpec {
    spec_id: string;
    mode: string;
    quote: { text: string };
    metadata: { author: string; source: string };
    
    // DIRECT OUTPUTS FOR UI & API
    jsonImagePrompt: string; // The massive, raw prompt for the Image Model
    jsonVideoPrompt: string; // The raw prompt for the Video Model
    
    caption: string;
    altText: string;
    hashtags: string[];
    
    // Technical metadata kept for reference if needed
    technical_specs: {
        aspect_ratio: string;
        resolution: string;
    }
}
