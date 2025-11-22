
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { RESPONSE_SCHEMA } from '../constants';
import { AssetSpec, Mode } from '../types';
import {
    STRICT_GUIDELINES,
    RELATABLE_SCENES,
    VIDEO_READY_ELEMENTS,
    SCENARIO_EXAMPLES,
    WATERMARK_POSITIONING,
    VIDEO_LOGIC
} from '../guidelines';
import { 
    getSystemPrompt, 
    getCombinedPlanPrompt, 
    getEditPrompt 
} from '../prompts';

export class GeminiService {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    private extractImageFromResponse(response: any): string {
        const candidates = response.candidates || [];
        for (const candidate of candidates) {
            const parts = candidate.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        throw new Error("No image content returned by the model.");
    }

    private getAspectRatioDescription(ratio: string): string {
        switch (ratio) {
            case '9:16': return 'VERTICAL 9:16 (1080x1920)';
            case '16:9': return 'HORIZONTAL 16:9 (1920x1080)';
            case '3:4': return 'VERTICAL 3:4 (1536x2048)';
            case '1:1': return 'SQUARE 1:1 (1024x1024)';
            default: return 'VERTICAL 9:16 (1080x1920)';
        }
    }

    async validateImageAspectRatio(base64Data: string, expectedRatio: string): Promise<boolean> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;
                console.debug(`[Validation] Expected: ${expectedRatio}, Got: ${width}x${height}`);

                if (expectedRatio === '9:16' || expectedRatio === '3:4') {
                    resolve(height > width * 1.05); 
                } else if (expectedRatio === '16:9') {
                    resolve(width > height * 1.05);
                } else {
                    const diff = Math.abs(width - height);
                    const avg = (width + height) / 2;
                    resolve(diff / avg < 0.15);
                }
            };
            img.onerror = () => {
                console.warn("Image validation failed to load data. REJECTING.");
                resolve(false); 
            };
            img.src = `data:image/png;base64,${base64Data}`;
        });
    }

    // --- STEP 1: COMBINED PLANNING ---
    async generateAssetPlan(
        mode: Mode,
        inputs: { quote: string; author: string; source: string },
        jsonInput: string,
        aspectRatio: string,
        history: { quotes: Set<string>; authors: string[] },
        options: {
            generateImagePrompt: boolean;
            generateVideoPrompt: boolean;
            generateCaption: boolean;
            generateActualImage: boolean;
            numberOfImages: 1 | 2;
        }
    ): Promise<AssetSpec> {
        if (mode === 'JSON') {
            try { return JSON.parse(jsonInput); } 
            catch (jsonError: any) { throw new Error(`Invalid JSON provided. ${jsonError.message}`); }
        }

        const ratioDesc = this.getAspectRatioDescription(aspectRatio);
        const systemPrompt = getSystemPrompt(
            STRICT_GUIDELINES,
            RELATABLE_SCENES,
            VIDEO_READY_ELEMENTS,
            SCENARIO_EXAMPLES,
            WATERMARK_POSITIONING,
            VIDEO_LOGIC
        );
        const userPrompt = getCombinedPlanPrompt(mode, inputs, ratioDesc, history, options);

        console.log("=== [STEP 1] INPUT PROMPT TO TEXT MODEL ===");
        console.log(`[Generating] Image Prompt: ${options.generateImagePrompt}, Video Prompt: ${options.generateVideoPrompt}, Caption: ${options.generateCaption}`);
        console.log(userPrompt);

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
            },
        });

        if (!response.text) throw new Error("Empty spec response.");
        
        // LOGGING: Raw Output
        console.log("=== [STEP 1] OUTPUT JSON FROM TEXT MODEL ===");
        console.log(response.text);

        return JSON.parse(response.text);
    }

    // --- STEP 2: GENERATE FINAL ASSET (Direct String Prompt) ---
    async generateFinalAsset(jsonPromptString: string, aspectRatio: string): Promise<string> {
        // jsonPromptString is already a string containing JSON structure
        // We pass it directly to the image model

        console.log("=== [STEP 2] JSON IMAGE PROMPT TO IMAGE MODEL ===");
        console.log(jsonPromptString);
        console.log("==================================================");

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: jsonPromptString }] },
            config: {
                // We add aspect ratio here as a fail-safe, but the prompt should also contain it.
                imageConfig: { aspectRatio: aspectRatio },
            },
        });

        return this.extractImageFromResponse(response);
    }
    
    async editImage(imageBase64: string, prompt: string, aspectRatio: string): Promise<string> {
         const ratioDesc = this.getAspectRatioDescription(aspectRatio);
         const editPrompt = getEditPrompt(prompt, ratioDesc);
         
         const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType: 'image/png' } },
                    { text: editPrompt },
                ],
            },
            config: { 
                responseModalities: [Modality.IMAGE],
            },
        });
        return this.extractImageFromResponse(response);
    }
}
