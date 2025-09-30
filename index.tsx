import { GoogleGenAI, Type, Modality } from '@google/genai';
import { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// The system prompt is the core of the application's logic.
// It is derived directly from the user's detailed instructions.
const SYSTEM_PROMPT = `You are Mantra Wayfinding. I Insta quote image generator.

Produce a ready-to-post Instagram motivation asset with:
• one image,
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

ANTI-REPETITION RULE: The user will provide a history of recently used quotes and authors.
-   You MUST NOT generate a quote that is in the 'Quote History' list.
-   You MUST STRONGLY AVOID generating a quote from an author in the 'Recent Author History' list (last 10).
-   This rule is critical. Acknowledge and follow it.

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
type Page = 'generate' | 'saved';
type Theme = 'light' | 'dark';

interface SavedAsset {
  id: string;
  imageDataUrl: string;
  spec: any; // The full JSON spec
  formattedCaption: string;
  timestamp: number;
}


const toUnicodeBold = (text: string) => {
    const boldMap: { [key: string]: string } = {
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝾾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(char => boldMap[char] || char).join('');
};


function App() {
  // UI State
  const [activePage, setActivePage] = useState<Page>('generate');
  const [theme, setTheme] = useState<Theme>('dark');
  const [userApiKey, setUserApiKey] = useState('');

  // Generation State
  const [mode, setMode] = useState<Mode>('AUTO');
  const [manualInputs, setManualInputs] = useState({ quote: '', author: '', source: '' });
  const [jsonInput, setJsonInput] = useState('');
  const [watermarkText, setWatermarkText] = useState('@mantra.wayfinding');
  const [watermarkPlacement, setWatermarkPlacement] = useState('Bottom - Right');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<any | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [formattedCaption, setFormattedCaption] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Image Editing State
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [renderedQuoteText, setRenderedQuoteText] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  // Saved Assets State
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
  const [viewingAsset, setViewingAsset] = useState<SavedAsset | null>(null);

  // Anti-repetition state, initialized from localStorage
  const [quoteHistory, setQuoteHistory] = useState(() => {
    try {
        const saved = localStorage.getItem('mantraQuoteHistory');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
        return new Set();
    }
  });
  const [authorHistory, setAuthorHistory] = useState(() => {
    try {
        const saved = localStorage.getItem('mantraAuthorHistory');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  // Effect to load saved assets from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mantraSavedAssets');
      if (saved) {
        setSavedAssets(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved assets from localStorage", e);
    }
  }, []);

  // Effect to save assets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mantraSavedAssets', JSON.stringify(savedAssets));
  }, [savedAssets]);


  // Effect to save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mantraQuoteHistory', JSON.stringify(Array.from(quoteHistory)));
    localStorage.setItem('mantraAuthorHistory', JSON.stringify(authorHistory));
  }, [quoteHistory, authorHistory]);

  // Effect to apply theme class to the root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const ai = useMemo(() => {
    const key = userApiKey.trim() || process.env.API_KEY;
    return new GoogleGenAI({ apiKey: key });
  }, [userApiKey]);
  
  const isCurrentAssetSaved = useMemo(() => {
      if (!output) return false;
      return savedAssets.some(asset => asset.id === output.spec_id);
  }, [output, savedAssets]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);
    setGeneratedImageUrl(null);
    setFormattedCaption('');
    setGeneratedImageBase64(null);
    setRenderedQuoteText(null);
    setEditPrompt('');

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
            let userPrompt = `Generate one new Instagram motivation asset in AUTO mode.`;
            if (mode === 'MANUAL') {
                userPrompt = `Generate one new Instagram motivation asset in MANUAL mode with the following inputs: custom_quote_text: '${manualInputs.quote}', custom_author: '${manualInputs.author}', custom_source_book: '${manualInputs.source}'. If the quote is invalid, replace it with a verified one on a similar theme.`;
            }
            
            // Inject history for anti-repetition
            const quoteHistoryStr = Array.from(quoteHistory).join('; ');
            const authorHistoryStr = authorHistory.join('; ');
            userPrompt += `\n\n---ANTI-REPETITION DATA---\nQuote History (DO NOT USE): ${quoteHistoryStr}\nRecent Author History (AVOID): ${authorHistoryStr}`;

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

            // Update history after successful generation
            setQuoteHistory(prev => new Set(prev).add(spec.quote.text));
            setAuthorHistory(prev => [spec.quote.author, ...prev].slice(0, 10));
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
                aspectRatio: aspectRatio,
            },
        });

        const blankImageBase64 = imageGenResponse.generatedImages[0].image.imageBytes;
        const blankImageMimeType = 'image/png';
        
        setLoadingMessage('Step 3/3: Magically printing the quote onto the scene...');

        const { background, quote, watermark } = spec;

        const compositionPrompt = `
**TASK: RENDER TEXT ON IMAGE, VERBATIM.**
This is a technical instruction. Do not be creative with the text.

**ABSOLUTE MANDATE:** You must render the following text onto the provided image with 100% character-for-character accuracy.

**SOURCE QUOTE (COPY EXACTLY):**
"""
${quote.text}
"""

**INSTRUCTIONS:**
1.  Read the "SOURCE QUOTE" above.
2.  Render this exact text onto the image.
3.  **VERIFY:** Before finalizing, perform a self-check. Does the text on your image match the "SOURCE QUOTE" perfectly?
4.  **FAILURE CONDITION:** Any deviation, even a single character, from the "SOURCE QUOTE" is a complete failure of this task. If it does not match, you must re-do it until it is a perfect 1:1 match.

**STYLING (Secondary to Accuracy):**
-   **Placement:** '${background.quotePlacement}'.
-   **Font Style:** Inspired by '${background.fontSuggestion}'.
-   **Integration:** Match the scene's lighting ('${background.lighting}').
-   Accuracy is the #1 priority. If styling conflicts with rendering the text exactly as written, prioritize accuracy.

**WATERMARK (Secondary Text):**
-   **Text:** "${watermark.text}"
-   **Placement:** Small, subtle, in the ${watermark.placement} corner.

**FINAL OUTPUT:** The response must contain ONLY the final rendered image. Do not include any other text, prose, or explanation.
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
                responseModalities: [Modality.IMAGE],
            },
        });
        
        let initialImageBase64 = '';
        if (compositionResponse.candidates?.[0]?.content?.parts) {
            for (const part of compositionResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    initialImageBase64 = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (!initialImageBase64) {
            throw new Error('Initial image composition failed to return an image.');
        }

        // --- Verification and Correction Loop ---
        let finalImageBase64 = initialImageBase64;
        let isVerified = false;
        const MAX_CORRECTION_ATTEMPTS = 4;
        const sourceQuote = spec.quote.text;
        const normalize = (str: string) => (str || '').trim().toLowerCase().replace(/['".,]/g, '');
        let lastOcrText = '';

        for (let i = 0; i < MAX_CORRECTION_ATTEMPTS; i++) {
            setLoadingMessage(`Step 3.${i + 1}/${MAX_CORRECTION_ATTEMPTS}: Verifying text accuracy...`);

            const ocrPrompt = `You are a highly accurate OCR (Optical Character Recognition) tool. Your only task is to transcribe the main, large-font quote written on this image.
- Be 100% literal. Transcribe exactly what you see, character for character.
- DO NOT add, remove, or correct any words, even if you think there is a mistake.
- Pay close attention to punctuation.
- Your entire response must be ONLY the text you read from the image. Do not add any other explanations, formatting, or quotation marks unless they are part of the image text itself.`;

            const ocrResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: finalImageBase64, mimeType: 'image/png' } },
                        { text: ocrPrompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.TEXT],
                },
            });

            const ocrText = ocrResponse.text.trim();
            lastOcrText = ocrText;

            if (normalize(ocrText) === normalize(sourceQuote)) {
                setRenderedQuoteText(sourceQuote);
                isVerified = true;
                break; // Success! Exit the loop.
            }

            // If not verified, attempt correction
            setLoadingMessage(`Step 3.${i + 1}b: Text is inaccurate. Auto-correcting...`);
            const correctionPrompt = `
**TASK: FIX TEXT ON IMAGE.**
This is a technical bug-fixing instruction.

---
**BUG REPORT**
---
-   **BUG:** The text on the image is WRONG.
-   **ACTUAL (INCORRECT) TEXT:** """${ocrText}"""
-   **EXPECTED (CORRECT) TEXT:** """${sourceQuote}"""

**INSTRUCTIONS:**
1.  **ERASE:** Find and completely remove the "ACTUAL (INCORRECT) TEXT" from the image.
2.  **REPLACE:** In the exact same location and style, render the "EXPECTED (CORRECT) TEXT".
3.  **VERBATIM RULE:** The new text must be a 100% character-for-character match of the "EXPECTED (CORRECT) TEXT".
4.  **VERIFY:** Before outputting, re-read the text on your generated image. Does it match the "EXPECTED (CORRECT) TEXT"? If not, do it again until it is a perfect match. This is the most important step.

**FINAL OUTPUT:** The response must contain ONLY the corrected image. Do not include any other text.
            `;

            const correctionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: finalImageBase64, mimeType: 'image/png' } },
                        { text: correctionPrompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            let correctedImageBase64 = '';
            if (correctionResponse.candidates?.[0]?.content?.parts) {
                for (const part of correctionResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        correctedImageBase64 = part.inlineData.data;
                        break;
                    }
                }
            }

            if (correctedImageBase64) {
                finalImageBase64 = correctedImageBase64;
            } else {
                 lastOcrText = `Correction step ${i+1} failed to produce an image.`;
                break;
            }
        }

        if (!isVerified) {
            setRenderedQuoteText(`"${lastOcrText}" (Auto-correction failed)`);
        }
        
        setGeneratedImageBase64(finalImageBase64);
        setGeneratedImageUrl(`data:image/png;base64,${finalImageBase64}`);
        
        // Format the final caption
        const { quote: specQuote, caption, hashtags } = spec;
        const formattedHashtags = hashtags.join(' ');
        const boldQuote = toUnicodeBold(specQuote.text);
        const finalCaption = `${boldQuote}\n- ${specQuote.author} (${specQuote.source_book})\n\n${caption}\n\n${formattedHashtags}`;
        setFormattedCaption(finalCaption);


    } catch (e) {
        console.error(e);
        let friendlyError = `An error occurred: ${e.message}`;
        if (e.message && (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED'))) {
            friendlyError = "Quota limit reached. The shared key may be busy. Please enter your own Gemini API key above to continue, or wait and try again later.";
        }
        setError(friendlyError);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleEditImage = async () => {
      if (!generatedImageBase64 || !editPrompt.trim()) {
        return;
      }
      setIsEditingImage(true);
      setError(null);

      try {
        const editResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [
              { inlineData: { data: generatedImageBase64, mimeType: 'image/png' } },
              { text: editPrompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });

        let newImageBase64 = '';
        for (const part of editResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            newImageBase64 = part.inlineData.data;
            break;
          }
        }

        if (!newImageBase64) {
          throw new Error('Image editing failed. The model did not return an image.');
        }

        setGeneratedImageBase64(newImageBase64);
        setGeneratedImageUrl(`data:image/png;base64,${newImageBase64}`);
        setEditPrompt(''); // Clear the prompt after successful edit

      } catch (e) {
        console.error(e);
        let friendlyError = `An error occurred during editing: ${e.message}`;
        setError(friendlyError);
      } finally {
        setIsEditingImage(false);
      }
    };


  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          // Could show a "Copied!" notification
      });
  };

  const handleSaveAsset = () => {
    if (!output || !generatedImageUrl || !formattedCaption) return;
    if (isCurrentAssetSaved) return;

    const newAsset: SavedAsset = {
      id: output.spec_id,
      imageDataUrl: generatedImageUrl,
      spec: output,
      formattedCaption: formattedCaption,
      timestamp: Date.now(),
    };
    setSavedAssets(prevAssets => [newAsset, ...prevAssets]);
  };

  const handleDeleteAsset = (idToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this saved asset?')) {
      setSavedAssets(prevAssets => prevAssets.filter(asset => asset.id !== idToDelete));
    }
  };


  const handleViewImage = () => {
    setViewingAsset(null);
    setIsModalOpen(true);
  };
  
  const handleViewSavedAsset = (asset: SavedAsset) => {
    setViewingAsset(asset);
    setIsModalOpen(true);
  };

  const downloadDataUrl = (dataUrl: string, fileName: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadImage = () => {
    if (generatedImageUrl) {
        const fileName = output?.spec_id ? `mantra_${output.spec_id}.png` : 'mantra_wayfinding.png';
        downloadDataUrl(generatedImageUrl, fileName);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="shell">
      <nav className="main-nav">
        <div className="nav-left">
          <div className="nav-title">Mantra Wayfinding</div>
          <a href="#" className={activePage === 'generate' ? 'active' : ''} onClick={() => setActivePage('generate')}>Generate</a>
          <a href="#" className={activePage === 'saved' ? 'active' : ''} onClick={() => setActivePage('saved')}>Saved</a>
        </div>
        <div className="nav-right">
            <div className="theme-switcher">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                <label className="switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="slider round"></span>
                </label>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
            </div>
        </div>
      </nav>
      <main className="main-content">
        {activePage === 'generate' ? (
            <>
                <div className="controls-panel">
                    <div className="controls-scroller">
                        <div className="control-group">
                            <h3 className="control-group-title">API Key</h3>
                            <div className="form-group">
                                <label htmlFor="api-key" id="api-key-label">
                                    Your Gemini API Key
                                    <span className={`api-key-status ${userApiKey ? 'user' : 'shared'}`}>
                                        {userApiKey ? 'Using Your Key' : 'Using Shared Key'}
                                    </span>
                                </label>
                                <input
                                    id="api-key"
                                    type="password"
                                    value={userApiKey}
                                    onChange={e => setUserApiKey(e.target.value)}
                                    placeholder="Defaults to shared key"
                                />
                                <p className="api-key-info">
                                    Using your own key can help avoid rate limits. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Get a key from Google AI Studio</a>.
                                </p>
                            </div>
                        </div>

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
                            <h3 className="control-group-title">Image Settings</h3>
                            <div className="form-group">
                                <label htmlFor="aspect-ratio">Aspect Ratio</label>
                                <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                                    <option value="3:4">3:4 (Portrait)</option>
                                    <option value="9:16">9:16 (Story / Reel)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="16:9">16:9 (Landscape)</option>
                                </select>
                            </div>
                        </div>

                        <div className="control-group">
                            <h3 className="control-group-title">Mode</h3>
                             <div className="radio-group">
                                {(['AUTO', 'MANUAL', 'JSON'] as Mode[]).map(m => (
                                    <div key={m}>
                                        <input
                                            type="radio"
                                            id={`mode-${m}`}
                                            name="mode"
                                            value={m}
                                            checked={mode === m}
                                            onChange={() => setMode(m)}
                                        />
                                        <label htmlFor={`mode-${m}`}>
                                            {m.charAt(0) + m.slice(1).toLowerCase()}
                                        </label>
                                    </div>
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
                    </div>
                     <button className="generate-button" onClick={handleGenerate} disabled={isLoading || isEditingImage}>
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
                                <div className="image-wrapper">
                                    <div className="image-container" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
                                        {generatedImageUrl && <img src={generatedImageUrl} alt={output.alt_text} className={isEditingImage ? 'editing' : ''} />}
                                    </div>
                                    {isEditingImage && (
                                        <div className="image-loader" role="status" aria-live="polite">
                                            <div className="spinner"></div>
                                            <span className="sr-only">Applying edits...</span>
                                        </div>
                                    )}
                                </div>

                                {generatedImageUrl && (
                                    <>
                                        <div className="action-buttons">
                                            <button className="action-button" onClick={handleViewImage}>View</button>
                                            <button className="action-button" onClick={handleDownloadImage}>Download</button>
                                            <button className="action-button" onClick={handleSaveAsset} disabled={isCurrentAssetSaved}>
                                                {isCurrentAssetSaved ? 'Saved ✓' : 'Save'}
                                            </button>
                                        </div>
                                        <div className="edit-image-controls">
                                            <textarea
                                                placeholder="Describe your edits (e.g., 'add a cat sitting on the wall')"
                                                value={editPrompt}
                                                onChange={(e) => setEditPrompt(e.target.value)}
                                                disabled={isEditingImage}
                                            />
                                            <button
                                                className="edit-button"
                                                onClick={handleEditImage}
                                                disabled={isEditingImage || !editPrompt.trim()}
                                            >
                                                {isEditingImage ? 'Applying...' : 'Apply Edits'}
                                            </button>
                                        </div>
                                    </>
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
                                     <p><strong>Input Quote:</strong> {output.quote.text}</p>
                                    {renderedQuoteText && (
                                        <p><strong>Output Quote:</strong> {renderedQuoteText}</p>
                                    )}
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
            </>
        ) : (
            <div className="saved-assets-page">
                {savedAssets.length === 0 ? (
                    <div className="placeholder-page">
                        <h2>No Saved Assets</h2>
                        <p>Your saved creations will appear here. Go generate some!</p>
                    </div>
                ) : (
                    <div className="saved-assets-grid">
                        {savedAssets.map(asset => (
                            <div key={asset.id} className="saved-asset-card">
                                <img src={asset.imageDataUrl} alt={asset.spec.alt_text} onClick={() => handleViewSavedAsset(asset)} />
                                <div className="saved-asset-overlay">
                                    <p className="quote">"{asset.spec.quote.text}"</p>
                                    <div className="saved-asset-actions">
                                        <button onClick={() => handleViewSavedAsset(asset)}>View</button>
                                        <button onClick={() => downloadDataUrl(asset.imageDataUrl, `mantra_${asset.id}.png`)}>Download</button>
                                        <button onClick={() => handleCopy(asset.formattedCaption)}>Copy Caption</button>
                                        <button className="delete" onClick={() => handleDeleteAsset(asset.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setViewingAsset(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => { setIsModalOpen(false); setViewingAsset(null); }} aria-label="Close" type="button">&times;</button>
                 {viewingAsset ? (
                    <div className="modal-detail-view">
                        <div className="modal-image-container">
                             <img src={viewingAsset.imageDataUrl} alt={viewingAsset.spec.alt_text} />
                        </div>
                        <div className="modal-details text-outputs">
                             <div className="form-group">
                                <label>Caption</label>
                                <button className="copy-button" onClick={() => handleCopy(viewingAsset.formattedCaption)}>Copy</button>
                                <textarea readOnly value={viewingAsset.formattedCaption}></textarea>
                            </div>
                              <div className="form-group">
                                <label>Alt Text</label>
                                <button className="copy-button" onClick={() => handleCopy(viewingAsset.spec.alt_text)}>Copy</button>
                                <textarea readOnly value={viewingAsset.spec.alt_text}></textarea>
                            </div>
                             <div className="form-group">
                                <label>JSON Spec</label>
                                <button className="copy-button" onClick={() => handleCopy(JSON.stringify(viewingAsset.spec, null, 2))}>Copy</button>
                                <textarea readOnly value={JSON.stringify(viewingAsset.spec, null, 2)}></textarea>
                            </div>
                        </div>
                    </div>
                ) : (
                    <img src={generatedImageUrl} alt={output?.alt_text} />
                )}
            </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);