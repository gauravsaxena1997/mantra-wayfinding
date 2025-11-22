
import { useState } from 'react';
import { AssetSpec } from '../types';

interface OutputPanelProps {
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    output: AssetSpec | null;
    generatedImages: string[];
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    formattedCaption: string;
    isEditing: boolean;
    handleEdit: (prompt: string) => void;
    onSave: () => void;
    isSaved: boolean;
    onView: () => void;
}

export const OutputPanel = ({
    isLoading, loadingMessage, error, output, 
    generatedImages, selectedImageIndex, setSelectedImageIndex,
    formattedCaption,
    isEditing, handleEdit, onSave, isSaved, onView
}: OutputPanelProps) => {
    const [editPrompt, setEditPrompt] = useState('');

    const handleCopy = (text: string) => navigator.clipboard.writeText(text);
    
    const selectedImageBase64 = generatedImages[selectedImageIndex];
    const selectedImageUrl = selectedImageBase64 ? `data:image/png;base64,${selectedImageBase64}` : null;

    const onDownload = () => {
        if (!selectedImageUrl) return;
        const link = document.createElement('a');
        link.href = selectedImageUrl;
        link.download = output?.spec_id ? `mantra_${output.spec_id}_v${selectedImageIndex + 1}.png` : 'mantra.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: 64, height: 64, marginBottom: '1rem'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p>Your generated asset will appear here.</p>
                </div>
            )}

            {output && (
                <div className="generated-content">
                     <div className="result-image-wrapper">
                        {generatedImages.length > 0 && (
                            <div className="variation-selector">
                                <p className="variation-label">Variations</p>
                                <div className="thumbnails">
                                    {generatedImages.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`thumbnail ${idx === selectedImageIndex ? 'selected' : ''}`}
                                            onClick={() => setSelectedImageIndex(idx)}
                                        >
                                            <img src={`data:image/png;base64,${img}`} alt={`Variation ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="image-wrapper">
                            <div className="image-container" style={{ aspectRatio: output.technical_specs?.aspect_ratio.replace(':', ' / ') || '9/16' }}>
                                {selectedImageUrl && <img src={selectedImageUrl} alt={output.altText} className={isEditing ? 'editing' : ''} />}
                            </div>
                            {isEditing && (
                                <div className="image-loader"><div className="spinner"></div><span>Applying edits...</span></div>
                            )}
                        </div>

                        {selectedImageUrl && (
                            <>
                                <div className="action-buttons">
                                    <button className="action-button" onClick={onView}>View Full</button>
                                    <button className="action-button" onClick={onDownload}>Download</button>
                                    <button className="action-button" onClick={onSave} disabled={isSaved}>{isSaved ? 'Saved ✓' : 'Save'}</button>
                                </div>
                                <div className="edit-image-controls">
                                    <textarea
                                        placeholder="Describe edits (e.g., 'make the light warmer')"
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        disabled={isEditing}
                                    />
                                    <button
                                        className="edit-button"
                                        onClick={() => { handleEdit(editPrompt); setEditPrompt(''); }}
                                        disabled={isEditing || !editPrompt.trim()}
                                    >
                                        {isEditing ? 'Applying...' : 'Apply Edits'}
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
                            <button className="copy-button" onClick={() => handleCopy(output.altText)}>Copy</button>
                            <textarea readOnly value={output.altText} style={{minHeight: '80px'}}></textarea>
                        </div>
                        
                        <div className="spec-panels">
                             <div className="form-group spec-panel">
                                <label>jsonImagePrompt (Raw)</label>
                                <button className="copy-button" onClick={() => handleCopy(output.jsonImagePrompt)}>Copy</button>
                                <textarea className="code-output" readOnly value={output.jsonImagePrompt}></textarea>
                            </div>
                            <div className="form-group spec-panel">
                                <label>jsonVideoPrompt (Raw)</label>
                                <button className="copy-button" onClick={() => handleCopy(output.jsonVideoPrompt)}>Copy</button>
                                <textarea className="code-output" readOnly value={output.jsonVideoPrompt}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
