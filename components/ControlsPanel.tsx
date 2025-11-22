
import { Mode } from '../types';

interface ControlsPanelProps {
    userApiKey: string;
    setUserApiKey: (key: string) => void;
    aspectRatio: string;
    setAspectRatio: (r: string) => void;
    mode: Mode;
    setMode: (m: Mode) => void;
    manualInputs: { quote: string; author: string; source: string };
    setManualInputs: (i: any) => void;
    jsonInput: string;
    setJsonInput: (s: string) => void;
    handleGenerate: () => void;
    isLoading: boolean;
    isEditing: boolean;
}

export const ControlsPanel = ({
    userApiKey, setUserApiKey,
    aspectRatio, setAspectRatio,
    mode, setMode,
    manualInputs, setManualInputs,
    jsonInput, setJsonInput,
    handleGenerate, isLoading, isEditing
}: ControlsPanelProps) => {
    return (
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
                        <p className="api-key-info">Using your own key prevents rate limits.</p>
                    </div>
                </div>

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
                                <label htmlFor={`mode-${m}`}>{m.charAt(0) + m.slice(1).toLowerCase()}</label>
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
                            <textarea id="json" value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder="Paste partial or full spec here" />
                        </div>
                    )}
                </div>
            </div>
             <button className="generate-button" onClick={handleGenerate} disabled={isLoading || isEditing}>
                {isLoading ? 'Generating...' : 'Generate Asset'}
            </button>
        </div>
    );
};
