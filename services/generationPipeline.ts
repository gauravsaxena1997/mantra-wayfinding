
import { GeminiService } from './gemini';
import { AssetSpec, Mode } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface OutputOptions {
    generateImagePrompt: boolean;
    generateVideoPrompt: boolean;
    generateCaption: boolean;
    generateActualImage: boolean;
    numberOfImages: 1 | 2;
}

export class GenerationPipeline {
    private service: GeminiService;

    constructor(apiKey: string) {
        const keyStatus = apiKey ? `...${apiKey.slice(-4)}` : "UNDEFINED/MISSING";
        console.log(`[Security Check] Pipeline initialized with Key: ${keyStatus}`);
        this.service = new GeminiService(apiKey);
    }

    private autoFixJSON(jsonString: string): string {
        let fixed = jsonString;

        // FIX 1: Remove non-ASCII characters (Japanese, Chinese, etc.)
        fixed = fixed.replace(/[^\x20-\x7E\n\r\t]/g, '');

        // FIX 2: Remove literal "," (quote-comma-quote) between properties
        // }","property" → },"property"
        // ]","property" → ],"property"
        fixed = fixed.replace(/([}\]])","([a-zA-Z_])/g, '$1,"$2');

        // FIX 3: Replace period before property names with comma (common AI error)
        // ."property" → ,"property"
        // This is safe because periods should never appear before property names in JSON
        fixed = fixed.replace(/\."([a-zA-Z_])/g, ',"$1');

        // FIX 4: Remove trailing commas before closing braces/brackets
        // This is safe and doesn't affect valid JSON
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

        console.log('[Auto-Fix] Applied minimal safe fixes (non-ASCII, quote-comma-quote, period→comma, trailing commas)');

        return fixed;
    }

    private validateAndFixJSON(jsonString: string, fieldName: string): string {
        // Check if empty or null
        if (!jsonString || jsonString.trim() === '' || jsonString === '""' || jsonString === 'null') {
            console.warn(`[${fieldName}] Empty or null value detected`);
            return '';
        }

        // FIRST ATTEMPT: Try to parse as-is
        try {
            const parsed = JSON.parse(jsonString);
            console.log(`✓ ${fieldName} is valid JSON on first attempt (${Object.keys(parsed).length} top-level keys, ${jsonString.length} chars)`);
            return jsonString;
        } catch (firstError: any) {
            console.warn(`[${fieldName}] First parse attempt failed: ${firstError.message}`);
            console.warn('[Auto-Fix] Attempting automatic repair...');
        }

        // SECOND ATTEMPT: Auto-fix and retry
        const fixedJSON = this.autoFixJSON(jsonString);

        try {
            const parsed = JSON.parse(fixedJSON);
            console.log(`✓ ${fieldName} is valid JSON after auto-fix! (${Object.keys(parsed).length} top-level keys, ${fixedJSON.length} chars)`);
            console.log('[Auto-Fix] Successfully repaired JSON');
            return fixedJSON;
        } catch (secondError: any) {
            console.warn('[Auto-Fix] Second attempt failed, trying AGGRESSIVE last-resort fixes...');

            // THIRD ATTEMPT: LAST RESORT AGGRESSIVE FIXES
            // Try to salvage the JSON by fixing the most common structural issues
            let lastResort = fixedJSON;

            // Fix unbalanced brackets/braces by counting and balancing
            const openBraces = (lastResort.match(/\{/g) || []).length;
            const closeBraces = (lastResort.match(/\}/g) || []).length;
            const openBrackets = (lastResort.match(/\[/g) || []).length;
            const closeBrackets = (lastResort.match(/\]/g) || []).length;

            // Add missing closing braces
            if (openBraces > closeBraces) {
                console.warn(`[Last Resort] Adding ${openBraces - closeBraces} missing closing braces`);
                lastResort += '}'.repeat(openBraces - closeBraces);
            }

            // Add missing closing brackets
            if (openBrackets > closeBrackets) {
                console.warn(`[Last Resort] Adding ${openBrackets - closeBrackets} missing closing brackets`);
                lastResort += ']'.repeat(openBrackets - closeBrackets);
            }

            // Remove extra closing braces
            if (closeBraces > openBraces) {
                console.warn(`[Last Resort] Removing ${closeBraces - openBraces} extra closing braces`);
                for (let i = 0; i < (closeBraces - openBraces); i++) {
                    lastResort = lastResort.replace(/\}([^}]*)$/, '$1');
                }
            }

            // Remove extra closing brackets
            if (closeBrackets > openBrackets) {
                console.warn(`[Last Resort] Removing ${closeBrackets - openBrackets} extra closing brackets`);
                for (let i = 0; i < (closeBrackets - openBrackets); i++) {
                    lastResort = lastResort.replace(/\]([^\]]*)$/, '$1');
                }
            }

            // Try parsing one more time
            try {
                const finalParsed = JSON.parse(lastResort);
                console.log(`✓ ${fieldName} is valid JSON after LAST RESORT fixes!`);
                return lastResort;
            } catch (thirdError: any) {
                // All three attempts failed - show detailed error
                const errorMatch = thirdError.message.match(/position (\d+)/);
                const errorPos = errorMatch ? parseInt(errorMatch[1]) : 0;

                console.error(`\n========== JSON VALIDATION ERROR (ALL ATTEMPTS FAILED) ==========`);
                console.error(`Field: ${fieldName}`);
                console.error(`Error: ${thirdError.message}`);

                if (errorPos > 0) {
                    const contextStart = Math.max(0, errorPos - 100);
                    const contextEnd = Math.min(lastResort.length, errorPos + 100);
                    console.error(`\nContext around error position ${errorPos}:`);
                    console.error(lastResort.substring(contextStart, contextEnd));
                    console.error(' '.repeat(errorPos - contextStart) + '^--- ERROR HERE');
                }

                console.error(`\nProblematic JSON (first 500 chars):`);
                console.error(lastResort.substring(0, 500));
                console.error(`\nProblematic JSON (last 500 chars):`);
                console.error(lastResort.substring(Math.max(0, lastResort.length - 500)));
                console.error(`\nTotal length: ${lastResort.length} characters`);
                console.error(`\nBracket balance: { ${openBraces} } ${closeBraces} | [ ${openBrackets} ] ${closeBrackets}`);
                console.error(`================================================================\n`);

                throw new Error(`Generated ${fieldName} is not valid JSON even after 3 repair attempts. Please try generating again.`);
            }
        }
    }

    async run(
        mode: Mode,
        inputs: { quote: string; author: string; source: string },
        jsonInput: string,
        aspectRatio: string,
        history: { quotes: Set<string>; authors: string[] },
        onProgress: (msg: string) => void,
        options: OutputOptions
    ): Promise<{ spec: AssetSpec; images: string[] }> {

        let spec: AssetSpec;

        // JSON_TO_IMAGE MODE: Skip text AI, use provided JSON directly
        if (mode === 'JSON_TO_IMAGE') {
            onProgress("Validating JSON and preparing for image generation...");

            // Validate the provided JSON
            try {
                const parsed = JSON.parse(jsonInput);
                console.log("✓ Provided JSON is valid");
            } catch (error: any) {
                console.error("Invalid JSON provided:", error.message);
                throw new Error(`Invalid JSON: ${error.message}. Please check your JSON format.`);
            }

            // Create minimal spec for JSON_TO_IMAGE mode
            spec = {
                spec_id: `mantra-json-${Date.now()}`,
                mode: 'JSON_TO_IMAGE',
                quote: { text: 'Custom JSON Prompt' },
                metadata: { author: 'Direct JSON', source: 'User Provided' },
                jsonImagePrompt: jsonInput, // Use provided JSON directly
                jsonVideoPrompt: '',
                caption: null,
                altText: null,
                technical_specs: {
                    aspect_ratio: aspectRatio,
                    resolution: aspectRatio === '9:16' ? '1080x1920' :
                                aspectRatio === '16:9' ? '1920x1080' :
                                aspectRatio === '3:4' ? '1536x2048' : '1024x1024'
                }
            };

            console.log("[JSON_TO_IMAGE Mode] Skipping text AI, using provided JSON directly");
        } else {
            // AUTO MODE: Generate via text AI
            onProgress("Phase 1: Directors Board (Generating JSON Spec)...");

            try {
                spec = await this.service.generateAssetPlan(mode, inputs, jsonInput, aspectRatio, history, options);

                // VALIDATE JSON STRINGS
                if (options.generateImagePrompt) {
                    if (spec.jsonImagePrompt) {
                        console.log("[Validating] jsonImagePrompt...");
                        spec.jsonImagePrompt = this.validateAndFixJSON(spec.jsonImagePrompt, "jsonImagePrompt");
                    } else {
                        console.warn("[Warning] jsonImagePrompt was requested but not generated by AI");
                        spec.jsonImagePrompt = '';
                    }
                } else {
                    spec.jsonImagePrompt = '';
                }

                if (options.generateVideoPrompt) {
                    if (spec.jsonVideoPrompt) {
                        console.log("[Validating] jsonVideoPrompt...");
                        spec.jsonVideoPrompt = this.validateAndFixJSON(spec.jsonVideoPrompt, "jsonVideoPrompt");
                    } else {
                        console.warn("[Warning] jsonVideoPrompt was requested but not generated by AI");
                        spec.jsonVideoPrompt = '';
                    }
                } else {
                    spec.jsonVideoPrompt = '';
                }

                if (!options.generateCaption) {
                    // User didn't request caption or altText, ensure they're null
                    spec.caption = null;
                    spec.altText = '';
                }

            } catch (e: any) {
                if (e.message?.includes('429')) {
                    console.warn("429 in Planning. Waiting 5s...");
                    await delay(5000);
                    throw new Error("Rate limit exceeded during Planning. Please wait 10s and try again.");
                }
                throw e;
            }

            // Delay after text AI call
            await delay(4000);
        }

        // STEP 2: SINGLE-SHOT GENERATION (Variations)
        const images: string[] = [];

        // In JSON_TO_IMAGE mode, always generate images
        // In AUTO mode, check if user requested images
        if (mode === 'AUTO' && !options.generateActualImage) {
            console.log("[Skipping] Image generation (not requested by user)");
            return { spec, images };
        }

        // Ensure we have a valid jsonImagePrompt for image generation
        if (!spec.jsonImagePrompt || spec.jsonImagePrompt.trim() === '') {
            console.error("[Error] Cannot generate images: jsonImagePrompt is empty");
            throw new Error("Cannot generate images without a valid jsonImagePrompt.");
        }

        // Different loading message based on mode
        if (mode === 'JSON_TO_IMAGE') {
            onProgress("Generating image from your JSON prompt...");
        } else {
            onProgress("Phase 2: Production (Generating Scenes)...");
        }

        // Execute variations SEQUENTIALLY based on user selection
        for (let i = 1; i <= options.numberOfImages; i++) {
            if (i > 1) {
                const msg = mode === 'JSON_TO_IMAGE'
                    ? `Generating variation ${i} (Cooling down)...`
                    : `Phase 2: Variation ${i} (Cooling down)...`;
                onProgress(msg);
                await delay(8000);
            }

            let generatedImage = '';
            let attempts = 0;
            const maxAttempts = 2;

            while (attempts < maxAttempts) {
                try {
                    if (attempts > 0) {
                        const retryMsg = mode === 'JSON_TO_IMAGE'
                            ? `Variation ${i}: Attempt ${attempts + 1} (Retrying)...`
                            : `Variation ${i}: Attempt ${attempts + 1} (Retrying)...`;
                        onProgress(retryMsg);
                    }
                    
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
