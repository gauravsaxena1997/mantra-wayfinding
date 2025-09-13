import { GoogleGenAI, Type, Modality } from '@google/genai';
import { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// The system prompt is the core of the application's logic.
// It is derived directly from the user's detailed instructions.
const SYSTEM_PROMPT = `You are Mantra Wayfinding. I Insta quote image generator.

Produce a ready-to-post Instagram motivation asset with:
• one image (1080×1440, 3:4),
• one caption,
• 6–8 hashtags,
• alt_text (accessibility).

OPERATING MODES

- AUTO — Select ONE short, verified self-development quote (≤25 words) with correct author + source. Maximize variety across authors/scenes/styles.
- MANUAL — If provided: custom_quote_text, custom_author, custom_source_book. Validate attribution/length; if unverifiable or >25 words, swap to a known, verified short quote aligned to theme.
- JSON: Input a specific format JSON in a text area.

CAPTION FORMAT
- The 'caption' field in the JSON should ONLY contain the engaging body text (e.g., "Every grand adventure..."), ending with an encouraging question and the ✨ emoji.
- Do NOT include the quote, author, or source in the 'caption' field itself. The final post format will be assembled programmatically.

PLACEMENT MODES ENUM (background.quotePlacement MUST be one of these)
- ENGRAVED_ON_STONE_WALL: The quote is chiseled into a clean, modern stone or concrete wall.
- PAINTED_ON_BRICK_FACADE: The quote is painted as a high-quality mural on an urban brick wall.
- NEON_SIGN_ON_BUILDING: The quote is displayed as a stylish neon sign against a dark or twilight building facade.
- PROJECTED_ON_MODERN_ARCHITECTURE: The quote is projected with light onto a large, minimalist architectural surface at dusk.
- METAL_PLAQUE_ON_WALL: The quote is on a sleek, brushed metal plaque affixed to a wall.
- LETTERPRESS_ON_THICK_CARDSTOCK: The quote is printed with the classic letterpress effect on high-quality, textured paper.
- TYPED_ON_VINTAGE_PAPER: The quote appears on a sheet of aged paper from a vintage typewriter.
- PAGE_IN_AN_OPEN_BOOK: The quote is printed on a page of a beautifully designed, open book.
- HIGH_QUALITY_POSTER_FRAME: The quote is displayed within a minimalist frame, hanging on a wall.
- WRITTEN_IN_SAND_ON_BEACH: The quote is neatly drawn into calm, smooth sand on a beach.
- CARVED_INTO_SMOOTH_WOOD: The quote is elegantly carved into a polished slab of wood or a smooth tree trunk.
- ARRANGED_WITH_STONES_OR_LEAVES: The quote is formed by carefully arranging natural elements like small stones or leaves on a flat surface.
- CERAMIC_PRINT_ON_COFFEE_MUG: The quote is printed cleanly on the side of a minimalist coffee mug.
- ETCHED_INTO_GLASS_PANE: The quote is subtly etched or frosted onto a clean glass window or panel.
- LABEL_ON_MINIMALIST_BOTTLE: The quote is designed as a high-end product label on a simple glass bottle.

ANTI-REPETITION (AUTO)
Maintain a no-repeat buffer of 30 across {quote text, author, book, scene type, vibe}. If collision, pivot.

SELF-CHECKS (must pass before responding)
- All strict_guidelines are understood and will be followed.
- Attribution verified + ≤25 words (else swap).
- background.quotePlacement is a valid value from the ENUM list.
- Only the quote + watermark will be readable in the final composition.
- The generated JSON will strictly adhere to the schema.

OUTPUT CONTRACT: Return only a valid JSON object that adheres to the provided schema. Do not include any other text, prose, or markdown formatting in your response.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        spec_id: { type: Type.STRING },
        mode: { type: Type.STRING },
        alt_text: { type: Type.STRING },
        quote: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                author: { type: Type.STRING },
                source_book: { type: Type.STRING },
            },
            required: ['text', 'author', 'source_book']
        },
        background: {
            type: Type.OBJECT,
            properties: {
                vibe: { type: Type.STRING },
                scene: { type: Type.STRING },
                quotePlacement: { type: Type.STRING },
                fontSuggestion: { type: Type.STRING },
                lighting: { type: Type.STRING },
                weather: { type: Type.STRING },
                people: { type: Type.STRING },
                style: { type: Type.STRING },
                image_prompt: { type: Type.STRING },
            },
            required: ['vibe', 'scene', 'quotePlacement', 'fontSuggestion', 'lighting', 'weather', 'people', 'style', 'image_prompt']
        },
        watermark: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                font: { type: Type.STRING },
                placement: { type: Type.STRING },
            },
            required: ['text', 'font', 'placement'],
        },
        caption: { type: Type.STRING },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        notes: { type: Type.STRING },
        strict_guidelines: {
            type: Type.OBJECT,
            properties: {
                readability: { type: Type.STRING, description: "Readability Above All: The quote is the hero of the image. Its legibility is the primary goal, overriding other aesthetic considerations if they conflict. The text must be instantly and effortlessly readable." },
                integration: { type: Type.STRING, description: "Realistic Integration: The quote should appear naturally integrated into the scene on a physical surface, respecting perspective, lighting, shadows, and texture. It should look physically present, not like a sticker." },
                aesthetic: { type: Type.STRING, description: "Aesthetic Consistency: All generated images should have a clean, modern, and photorealistic feel." },
                safety: { type: Type.STRING, description: "Brand Safety: No logos, recognizable brands, celebrities, political symbols, or sensitive content is ever permitted." },
                distractions: { type: Type.STRING, description: "No Distractions: The only readable text in the image is the quote and a subtle watermark. Any other text in the scene (e.g., on signs, books) must be illegible." },
                caption_format: { type: Type.STRING, description: "Confirms understanding of the multi-line caption structure: Quote, Author/Source, Blank Line, Caption Body, Blank Line, Hashtags." },
            },
            required: ['readability', 'integration', 'aesthetic', 'safety', 'distractions', 'caption_format']
        },
    },
    required: ['spec_id', 'mode', 'alt_text', 'quote', 'background', 'watermark', 'caption', 'hashtags', 'notes', 'strict_guidelines']
};


type Mode = 'AUTO' | 'MANUAL' | 'JSON';

function App() {
  const [mode, setMode] = useState<Mode>('AUTO');
  const [manualInputs, setManualInputs] = useState({ quote: '', author: '', source: '' });
  const [jsonInput, setJsonInput] = useState('');
  const [watermarkText, setWatermarkText] = useState('@matra.wayfinding');
  const [watermarkPlacement, setWatermarkPlacement] = useState('Bottom - Right');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<any | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [formattedCaption, setFormattedCaption] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setGeneratedImageUrl(null);
    setFormattedCaption('');

    let spec = null;

    try {
        setLoadingMessage('Step 1/3: Crafting the perfect scene and quote...');
        
        if (mode === 'JSON') {
            try {
                spec = JSON.parse(jsonInput);
            } catch (jsonError) {
                 throw new Error(`Invalid JSON provided. Please check the format. ${jsonError.message}`);
            }
        } else {
            let userPrompt = "Generate one new Instagram motivation asset in AUTO mode. Ensure it does not repeat recent themes.";
            if (mode === 'MANUAL') {
                userPrompt = `Generate one new Instagram motivation asset in MANUAL mode with the following inputs: custom_quote_text: '${manualInputs.quote}', custom_author: '${manualInputs.author}', custom_source_book: '${manualInputs.source}'. If the quote is invalid, replace it with a verified one on a similar theme.`;
            }
            
            const specResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                },
            });

            if (!specResponse.text || specResponse.text.trim() === '') {
                 throw new Error("The model returned an empty response for the spec generation. This could be due to a content safety policy. Please try a different prompt.");
            }
            spec = JSON.parse(specResponse.text.trim());
        }

        // Override spec with user settings from controls
        spec.watermark.text = watermarkText;
        spec.watermark.placement = watermarkPlacement;

        setOutput(spec);

        setLoadingMessage('Step 2/3: Generating a beautiful background image...');
        
        const imageGenResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: spec.background.image_prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '3:4',
            },
        });

        const blankImageBase64 = imageGenResponse.generatedImages[0].image.imageBytes;
        const blankImageMimeType = 'image/png';
        
        setLoadingMessage('Step 3/3: Magically printing the quote onto the scene...');

        const { strict_guidelines, background, quote, watermark } = spec;

        const compositionPrompt = `
**CRITICAL INSTRUCTIONS: You MUST follow these rules to create a photorealistic image.**

1.  **STRICT GUIDELINES ADHERENCE:**
    *   **Readability:** "${strict_guidelines.readability}"
    *   **Integration:** "${strict_guidelines.integration}"
    *   **Aesthetic:** "${strict_guidelines.aesthetic}"
    *   **No Distractions:** "${strict_guidelines.distractions}"

2.  **PHYSICAL SIMULATION (NO FLAT OVERLAYS):**
    *   **ABSOLUTELY NO "STICKERS" OR FLAT TEXT.** The text must look like a physical part of the surface.
    *   If the placement is '${background.quotePlacement}', simulate that physical process.
    *   For **CARVED** or **ENGRAVED** text: It must have visible depth, inner shadows, and highlights consistent with the scene's lighting ('${background.lighting}'). The surface material (e.g., wood grain) must be visible *inside* the letters.
    *   For **PAINTED** text: It must follow the surface's micro-texture (e.g., brick mortar lines, canvas weave). It should not be perfectly smooth unless the surface is.
    *   For **PROJECTED** text: It must have soft edges and its brightness must realistically illuminate the surrounding surface.

3.  **COMPOSITION DETAILS:**
    *   **Font:** Use a font style inspired by: '${background.fontSuggestion}'.
    *   **Quote Text:** Render this EXACT text: "${quote.text}"
    *   **Author Text:** DO NOT render the author's name on the image.
    *   **Watermark:** Add a very small, subtle watermark in the **${watermark.placement}** corner with the text: "${watermark.text}". **IMPORTANT**: The watermark must have a small, visible gap from the image edges to ensure it is not cut off.

Return ONLY the final composited image. Failure to follow these rules will result in an unacceptable image.
`;
        
        const compositionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: blankImageBase64, mimeType: blankImageMimeType } },
                    { text: compositionPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        let finalImageBase64 = '';
        for (const part of compositionResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                finalImageBase64 = part.inlineData.data;
                break;
            }
        }

        if (!finalImageBase64) {
            throw new Error('Image composition failed. The model did not return an image.');
        }

        setGeneratedImageUrl(`data:image/png;base64,${finalImageBase64}`);
        
        // Format the final caption
        const { quote: specQuote, caption, hashtags } = spec;
        const formattedHashtags = hashtags.join(' ');
        const finalCaption = `${specQuote.text}\n- ${specQuote.author} (${specQuote.source_book})\n\n${caption}\n\n${formattedHashtags}`;
        setFormattedCaption(finalCaption);


    } catch (e) {
        console.error(e);
        setError(`An error occurred: ${e.message}`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          // Could show a "Copied!" notification
      });
  };

  const handleViewImage = () => {
    setIsModalOpen(true);
  };

  const handleDownloadImage = () => {
    if (generatedImageUrl) {
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        const fileName = output?.spec_id ? `mantra_${output.spec_id}.png` : 'mantra_wayfinding.png';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <>
        <header>
            <h1>Mantra Wayfinding</h1>
            <p>Instant Instagram Quote Image Generator</p>
        </header>
        <div className="app-container">
            <div className="controls-panel">
                <h2>Controls</h2>
                
                <div className="control-group">
                    <h3 className="control-group-title">Watermark</h3>
                    <div className="form-group">
                        <label htmlFor="watermark-text">Watermark Text</label>
                        <input id="watermark-text" type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="watermark-placement">Watermark Placement</label>
                        <select id="watermark-placement" value={watermarkPlacement} onChange={e => setWatermarkPlacement(e.target.value)}>
                            <option>Bottom - Right</option>
                            <option>Bottom - Left</option>
                            <option>Top - Right</option>
                            <option>Top - Left</option>
                        </select>
                    </div>
                </div>

                <div className="control-group">
                    <h3 className="control-group-title">Mode</h3>
                    <div className="tabs">
                        {(['AUTO', 'MANUAL', 'JSON'] as Mode[]).map(m => (
                            <button key={m} className={`tab ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
                                {m.charAt(0) + m.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {mode === 'MANUAL' && (
                        <div className="form-group">
                            <label htmlFor="quote">Custom Quote</label>
                            <textarea id="quote" value={manualInputs.quote} onChange={e => setManualInputs({...manualInputs, quote: e.target.value})} />
                            <label htmlFor="author">Author</label>
                            <input id="author" type="text" value={manualInputs.author} onChange={e => setManualInputs({...manualInputs, author: e.target.value})} />
                            <label htmlFor="source">Source</label>
                            <input id="source" type="text" value={manualInputs.source} onChange={e => setManualInputs({...manualInputs, source: e.target.value})} />
                        </div>
                    )}
                    {mode === 'JSON' && (
                        <div className="form-group">
                            <label htmlFor="json">JSON Spec</label>
                            <textarea id="json" value={jsonInput} onChange={e => setJsonInput(e.target.value)} />
                        </div>
                    )}
                </div>

                <button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Asset'}
                </button>
            </div>

            <div className="output-panel">
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>{loadingMessage}</p>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                {!isLoading && !error && !output && (
                    <div className="placeholder">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <p>Your generated asset will appear here.</p>
                    </div>
                )}
                {output && (
                    <div className="generated-content">
                         <div className="result-image-wrapper">
                            <div className="image-container">
                                {generatedImageUrl && <img src={generatedImageUrl} alt={output.alt_text} />}
                            </div>
                            {generatedImageUrl && (
                                <div className="action-buttons">
                                    <button className="action-button" onClick={handleViewImage}>View</button>
                                    <button className="action-button" onClick={handleDownloadImage}>Download</button>
                                </div>
                            )}
                        </div>
                        <div className="text-outputs">
                             <div className="form-group">
                                <label>Caption</label>
                                <button className="copy-button" onClick={() => handleCopy(formattedCaption)}>Copy</button>
                                <textarea id="caption-output" readOnly value={formattedCaption}></textarea>
                            </div>
                              <div className="form-group">
                                <label>Alt Text</label>
                                <button className="copy-button" onClick={() => handleCopy(output.alt_text)}>Copy</button>
                                <textarea readOnly value={output.alt_text}></textarea>
                            </div>
                             <div className="generation-parameters">
                                <h3>Used Parameters</h3>
                                <p><strong>Placement Mode:</strong> {output.background.quotePlacement}</p>
                                <p><strong>Vibe:</strong> {output.background.vibe}</p>
                                <p><strong>Scene:</strong> {output.background.scene}</p>
                                <p><strong>Lighting:</strong> {output.background.lighting}</p>
                                <p><strong>Style:</strong> {output.background.style}</p>
                             </div>
                             <div className="form-group">
                                <label>Generated JSON Spec</label>
                                <button className="copy-button" onClick={() => handleCopy(JSON.stringify(output, null, 2))}>Copy</button>
                                <textarea id="json-output" readOnly value={output ? JSON.stringify(output, null, 2) : ''}></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {isModalOpen && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close" type="button">&times;</button>
                    <img src={generatedImageUrl} alt={output.alt_text} />
                </div>
            </div>
        )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);