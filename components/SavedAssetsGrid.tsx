import { SavedAsset } from '../types';

interface SavedAssetsGridProps {
    assets: SavedAsset[];
    onDelete: (id: string) => void;
    onView: (asset: SavedAsset) => void;
}

export const SavedAssetsGrid = ({ assets, onDelete, onView }: SavedAssetsGridProps) => {
    if (assets.length === 0) {
        return (
            <div className="saved-assets-page">
                <div className="placeholder-page">
                    <h2>No Saved Assets</h2>
                    <p>Your saved creations will appear here.</p>
                </div>
            </div>
        );
    }

    const handleDownload = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="saved-assets-page">
            <div className="saved-assets-grid">
                {assets.map(asset => (
                    <div key={asset.id} className="saved-asset-card">
                        <img src={asset.imageDataUrl} alt={asset.spec.altText} onClick={() => onView(asset)} />
                        <div className="saved-asset-overlay">
                            <p className="quote">"{asset.spec.quote.text}"</p>
                            <div className="saved-asset-actions">
                                <button onClick={() => onView(asset)}>View</button>
                                <button onClick={() => handleDownload(asset.imageDataUrl, `mantra_${asset.id}.png`)}>DL</button>
                                <button onClick={() => handleCopy(asset.formattedCaption)}>Caption</button>
                                <button className="delete" onClick={() => onDelete(asset.id)}>Del</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};