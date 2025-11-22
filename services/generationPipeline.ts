
import { GeminiService } from './gemini';
import { AssetSpec, Mode } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GenerationPipeline {
    private service: GeminiService;

    constructor(apiKey: string) {
        const keyStatus = apiKey ? `...${apiKey.slice(-4)}` : "UNDEFINED/MISSING";
        console.log(`[Security Check] Pipeline initialized with Key: ${keyStatus}`);
        this.service = new GeminiService(apiKey);
    }

    async run(
        mode: Mode,
        inputs: { quote: string; author: string; source: string },
        jsonInput: string,
        aspectRatio: string,
        history: { quotes: Set<string>; authors: string[] },
        onProgress: (msg: string) => void
    ): Promise<{ spec: AssetSpec; images: string[] }> {
        
        // STEP 1: THE UNIFIED PLAN
        onProgress("Phase 1: Directors Board (Generating JSON Spec)...");
        let spec: AssetSpec;
        
        try {
            spec = await this.service.generateAssetPlan(mode, inputs, jsonInput, aspectRatio, history);
        } catch (e: any) {
             if (e.message?.includes('429')) {
                console.warn("429 in Planning. Waiting 5s...");
                await delay(5000);
                throw new Error("Rate limit exceeded during Planning. Please wait 10s and try again.");
            }
            throw e;
        }

        await delay(4000); 

        // STEP 2: SINGLE-SHOT GENERATION (Variations)
        onProgress("Phase 2: Production (Generating Scenes)...");
        const images: string[] = [];

        // Execute variations SEQUENTIALLY
        for (let i = 1; i <= 2; i++) {
            if (i > 1) {
                onProgress(`Phase 2: Variation ${i} (Cooling down)...`);
                await delay(8000); 
            }

            let generatedImage = '';
            let attempts = 0;
            const maxAttempts = 2; 
            
            while (attempts < maxAttempts) {
                try {
                    if (attempts > 0) onProgress(`Variation ${i}: Attempt ${attempts + 1} (Retrying)...`);
                    
                    // PASS THE RAW STRING PROMPT DIRECTLY
                    generatedImage = await this.service.generateFinalAsset(spec.jsonImagePrompt, aspectRatio);
                    
                    const isValidRatio = await this.service.validateImageAspectRatio(generatedImage, aspectRatio);
                    
                    if (isValidRatio) break;
                    
                    console.warn(`[Variation ${i} Attempt ${attempts + 1}] Incorrect aspect ratio. Retrying...`);
                    generatedImage = '';
                } catch (e: any) {
                    console.error(`[Variation ${i} Attempt ${attempts + 1}] Error:`, e);
                    if (e.message?.includes('429')) {
                        onProgress(`Rate limit hit. Cooling down (5s)...`);
                        await delay(5000);
                    } else {
                        await delay(2000);
                    }
                }
                attempts++;
            }

            if (generatedImage) {
                images.push(generatedImage);
            } else {
                console.error(`Failed to generate Variation ${i}`);
                if (i === 1) throw new Error("Failed to generate first variation.");
            }
        }

        return { spec, images };
    }
}
