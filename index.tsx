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

NON-NEGOTIABLE IMAGE/TEXT POLICY

1. Only readable text in the image:
a) the quote, and
b) a tiny watermark handle.
If the scene contains signage/posters/labels, render them blank or make them illegible via angle, distance, depth of field, texture/noise. Never show ratios/prompts/seeds/model names/“3:4”/numbers in the image.
2. Real surface placement: quote must appear printed/painted on a physical surface in-scene (not floating), with correct perspective, texture, shadows/reflections.
3. Legibility: bold modern sans; high contrast; watermark = @mantra.wayfinding bottom-right, subtle.
4. Safety: no brands/logos/celebrities/political symbols/profane or sensitive imagery.

ANTI-REPETITION (AUTO)
Maintain a no-repeat buffer of 30 across {quote text, author, book, scene type, vibe}. If collision, pivot.

AUTHOR/BOOK GUARDRAILS (examples, not exhaustive)
James Clear (Atomic Habits), Cal Newport (Deep Work), Carol Dweck (Mindset), Stephen R. Covey, Viktor Frankl, Angela Duckworth, Ryan Holiday, Marcus Aurelius, Seneca, Epictetus, Thich Nhat Hanh, Maya Angelou, Emerson, William James, Oliver Burkeman, Naval Ravikant (Almanack). Use only short, widely cited lines with clear attribution.

IMAGE GENERATION TEMPLATE (internal guidance)
"Photorealistic {vibe} {scene} featuring a clear {placement.mode} sized for a 3:4 poster area.
Lighting: {lighting}. Weather/mood: {weather}. People: {people} (no identifiable faces).

STRICT RULES:
- The ONLY readable text in the final image must be the printed quote + tiny watermark.
- Any environmental signage/labels must be blank or illegible via angle/blur/distance.
- Do NOT show ratios, seeds, prompts, or numbers anywhere in the image.
- The {placement.mode} surface must be perspective-correct with real texture (paper/board/glass/paint) and realistic shadows/reflections.
- Output 1080x1440 (3:4).
- Return the surface BLANK, ready for text placement. Color grade: {style}. Natural, brand-safe, documentary feel."

SELF-CHECKS (must pass before responding)
- Attribution verified + ≤25 words (else swap).
- Only the quote + watermark will be readable in the final composition.
- Text sits on a real in-scene surface, perspective-correct.
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
                verified: { type: Type.BOOLEAN },
            },
            required: ['text', 'author', 'source_book', 'verified']
        },
        background: {
            type: Type.OBJECT,
            properties: {
                vibe: { type: Type.STRING },
                scene: { type: Type.STRING },
                surface: { type: Type.STRING },
                lighting: { type: Type.STRING },
                weather: { type: Type.STRING },
                people: { type: Type.STRING },
                style: { type: Type.STRING },
                image_prompt: { type: Type.STRING },
            },
            required: ['image_prompt']
        },
        placement: {
            type: Type.OBJECT,
            properties: {
                mode: { type: Type.STRING },
            },
            required: ['mode'],
        },
        typography: {
            type: Type.OBJECT,
            properties: {
                watermark_handle: { type: Type.STRING },
            },
            required: ['watermark_handle']
        },
        caption: { type: Type.STRING },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        notes: { type: Type.STRING },
    },
    required: ['spec_id', 'mode', 'alt_text', 'quote', 'background', 'placement', 'caption', 'hashtags', 'typography']
};


type Mode = 'AUTO' | 'MANUAL' | 'JSON';

function App() {
  const [mode, setMode] = useState<Mode>('AUTO');
  const [manualInputs, setManualInputs] = useState({ quote: '', author: '', source: '' });
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<any | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [formattedCaption, setFormattedCaption] = useState('');

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

        const watermark = spec.typography?.watermark_handle || '@mantra.wayfinding';
        const compositionPrompt = `Using a bold modern sans-serif font, print the following quote onto the blank surface in the image: "${spec.quote.text}" — ${spec.quote.author}. Also, add a small, subtle watermark in the bottom-right corner: "${watermark}". The final image must be high-contrast and legible, respecting the perspective of the surface. Return ONLY the final image.`;
        
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
        const { quote, caption, hashtags } = spec;
        const finalCaption = `${quote.text}\n\n${caption}\n\nAuthor: ${quote.author}\nSource: ${quote.source_book}\n\n${hashtags.join(' ')}`;
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

  return (
    <>
        <header>
            <h1>Mantra Wayfinding</h1>
            <p>Instant Instagram Quote Image Generator</p>
        </header>
        <div className="app-container">
            <div className="controls-panel">
                <h2>Controls</h2>
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
                        <div className="image-container">
                            {generatedImageUrl && <img src={generatedImageUrl} alt={output.alt_text} />}
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
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);