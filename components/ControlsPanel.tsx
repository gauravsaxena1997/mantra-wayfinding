
import { Mode } from '../types';

interface ControlsPanelProps {
    aspectRatio: string;
    setAspectRatio: (r: string) => void;
    mode: Mode;
    setMode: (m: Mode) => void;
    jsonInput: string;
    setJsonInput: (s: string) => void;

    // Output options
    generateImagePrompt: boolean;
    setGenerateImagePrompt: (v: boolean) => void;
    generateVideoPrompt: boolean;
    setGenerateVideoPrompt: (v: boolean) => void;
    generateCaption: boolean;
    setGenerateCaption: (v: boolean) => void;
    generateActualImage: boolean;
    setGenerateActualImage: (v: boolean) => void;
    numberOfImages: 1 | 2;
    setNumberOfImages: (n: 1 | 2) => void;

    handleGenerate: () => void;
    isLoading: boolean;
    isEditing: boolean;
}

export const ControlsPanel = ({
    aspectRatio, setAspectRatio,
    mode, setMode,
    jsonInput, setJsonInput,
    generateImagePrompt, setGenerateImagePrompt,
    generateVideoPrompt, setGenerateVideoPrompt,
    generateCaption, setGenerateCaption,
    generateActualImage, setGenerateActualImage,
    numberOfImages, setNumberOfImages,
    handleGenerate, isLoading, isEditing
}: ControlsPanelProps) => {
    return (
        <div className="controls-panel">
            <div className="controls-scroller">
                <div className="control-group">
                    <h3 className="control-group-title">Image Settings</h3>
                    <div className="form-group">
                        <label htmlFor="aspect-ratio">Aspect Ratio</label>
                        <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                            <option value="9:16">9:16 (Story / Reel)</option>
                            <option value="3:4">3:4 (Portrait)</option>
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                        </select>
                    </div>
                </div>

                <div className="control-group">
                    <h3 className="control-group-title">Mode</h3>
                     <div className="radio-group">
                        {(['AUTO', 'JSON_TO_IMAGE'] as Mode[]).map(m => (
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
                                    {m === 'JSON_TO_IMAGE' ? 'JSON to Image' : 'Auto'}
                                </label>
                            </div>
                        ))}
                    </div>

                    {mode === 'JSON_TO_IMAGE' && (
                        <div className="form-group">
                            <label htmlFor="json">JSON Image Prompt</label>
                            <textarea
                                id="json"
                                value={jsonInput}
                                onChange={e => setJsonInput(e.target.value)}
                                placeholder="Paste your jsonImagePrompt JSON here"
                                style={{minHeight: '120px', fontFamily: 'monospace', fontSize: '0.85rem'}}
                            />
                        </div>
                    )}
                </div>

                {mode === 'AUTO' && (
                    <div className="control-group">
                        <h3 className="control-group-title">Output Options</h3>
                        <p className="output-options-hint">
                            Select what you want to generate (1 API call for all selected)
                        </p>

                        <div className="output-options-grid">
                            <label className="output-option-label">
                                <input
                                    type="checkbox"
                                    checked={generateImagePrompt}
                                    onChange={(e) => setGenerateImagePrompt(e.target.checked)}
                                    className="output-checkbox"
                                />
                                <span>JSON Image Prompt</span>
                            </label>

                            <label className="output-option-label">
                                <input
                                    type="checkbox"
                                    checked={generateVideoPrompt}
                                    onChange={(e) => setGenerateVideoPrompt(e.target.checked)}
                                    className="output-checkbox"
                                />
                                <span>JSON Video Prompt</span>
                            </label>

                            <label className="output-option-label">
                                <input
                                    type="checkbox"
                                    checked={generateCaption}
                                    onChange={(e) => setGenerateCaption(e.target.checked)}
                                    className="output-checkbox"
                                />
                                <span>Caption & Alt Text</span>
                            </label>

                            <label className="output-option-label">
                                <input
                                    type="checkbox"
                                    checked={generateActualImage}
                                    onChange={(e) => setGenerateActualImage(e.target.checked)}
                                    className="output-checkbox"
                                />
                                <span>Actual Image</span>
                            </label>

                            {generateActualImage && (
                                <div className="image-count-selector">
                                    <label htmlFor="num-images">Variations:</label>
                                    <select
                                        id="num-images"
                                        value={numberOfImages}
                                        onChange={(e) => setNumberOfImages(Number(e.target.value) as 1 | 2)}
                                    >
                                        <option value="1">1 Image</option>
                                        <option value="2">2 Images</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {mode === 'JSON_TO_IMAGE' && (
                    <div className="control-group">
                        <h3 className="control-group-title">Image Variations</h3>
                        <div className="form-group">
                            <label htmlFor="num-images-json">Number of Variations</label>
                            <select
                                id="num-images-json"
                                value={numberOfImages}
                                onChange={(e) => setNumberOfImages(Number(e.target.value) as 1 | 2)}
                            >
                                <option value="1">1 Image</option>
                                <option value="2">2 Images</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
             <button
                className="generate-button"
                onClick={handleGenerate}
                disabled={
                    isLoading || isEditing ||
                    (mode === 'AUTO' && !generateImagePrompt && !generateVideoPrompt && !generateCaption && !generateActualImage) ||
                    (mode === 'JSON_TO_IMAGE' && !jsonInput.trim())
                }
            >
                {isLoading ? 'Generating...' : mode === 'JSON_TO_IMAGE' ? 'Generate Image' : 'Generate Asset'}
            </button>
        </div>
    );
};
