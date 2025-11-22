import { SavedAsset, AssetSpec } from '../types';

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset?: SavedAsset;
    currentImage?: string | null;
    currentOutput?: AssetSpec | null;
    currentCaption?: string;
}

export const AssetModal = ({ isOpen, onClose, asset, currentImage, currentOutput, currentCaption }: AssetModalProps) => {
    if (!isOpen) return null;

    const imageSrc = asset ? asset.imageDataUrl : currentImage;
    const spec = asset ? asset.spec : currentOutput;
    const caption = asset ? asset.formattedCaption : currentCaption;
    
    if (!imageSrc) return null;

    const handleCopy = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close" type="button">&times;</button>
                 {spec ? (
                    <div className="modal-detail-view">
                        <div className="modal-image-container">
                             <img src={imageSrc} alt={spec.altText} />
                        </div>
                        <div className="modal-details text-outputs">
                             <div className="form-group">
                                <label>Caption</label>
                                <button className="copy-button" onClick={() => handleCopy(caption || '')}>Copy</button>
                                <textarea readOnly value={caption}></textarea>
                            </div>
                            <div className="form-group spec-panel">
                                <label>Image Prompt</label>
                                <button className="copy-button" onClick={() => handleCopy(spec.jsonImagePrompt)}>Copy</button>
                                <textarea className="code-output" readOnly value={spec.jsonImagePrompt}></textarea>
                            </div>
                             <div className="form-group spec-panel">
                                <label>Video Prompt</label>
                                <button className="copy-button" onClick={() => handleCopy(spec.jsonVideoPrompt)}>Copy</button>
                                <textarea className="code-output" readOnly value={spec.jsonVideoPrompt}></textarea>
                            </div>
                        </div>
                    </div>
                ) : (
                    <img src={imageSrc} />
                )}
            </div>
        </div>
    );
};