
import { useState, useEffect } from 'react';
import { Page, Theme, SavedAsset } from './types';
import { useAssetGenerator } from './hooks/useAssetGenerator';
import { NavBar } from './components/NavBar';
import { ControlsPanel } from './components/ControlsPanel';
import { OutputPanel } from './components/OutputPanel';
import { SavedAssetsGrid } from './components/SavedAssetsGrid';
import { AssetModal } from './components/AssetModal';

export default function App() {
    const [activePage, setActivePage] = useState<Page>('generate');
    const [theme, setTheme] = useState<Theme>('dark');
    const [userApiKey, setUserApiKey] = useState('');
    const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
    const [modalState, setModalState] = useState<{ isOpen: boolean; asset?: SavedAsset }>({ isOpen: false });

    // Load Saved Assets
    useEffect(() => {
        try {
            const saved = localStorage.getItem('mantraSavedAssets');
            if (saved) setSavedAssets(JSON.parse(saved));
        } catch (e) { console.error("Failed to load assets", e); }
    }, []);

    useEffect(() => {
        localStorage.setItem('mantraSavedAssets', JSON.stringify(savedAssets));
    }, [savedAssets]);

    // Theme Management
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(`theme-${theme}`);
    }, [theme]);

    const generator = useAssetGenerator(userApiKey);

    // Get current selected image
    const currentSelectedImageBase64 = generator.generatedImages[generator.selectedImageIndex];
    const generatedImageUrl = currentSelectedImageBase64 ? `data:image/png;base64,${currentSelectedImageBase64}` : null;

    const handleSaveAsset = () => {
        if (!generator.output || !currentSelectedImageBase64 || !generator.formattedCaption) return;
        const imageUrl = `data:image/png;base64,${currentSelectedImageBase64}`;
        const newAsset: SavedAsset = {
            id: `${generator.output.spec_id}_v${generator.selectedImageIndex}`,
            imageDataUrl: imageUrl,
            spec: generator.output,
            formattedCaption: generator.formattedCaption,
            timestamp: Date.now(),
        };
        setSavedAssets(prev => [newAsset, ...prev]);
    };

    const handleDeleteAsset = (id: string) => {
        if (window.confirm('Delete this asset?')) {
            setSavedAssets(prev => prev.filter(a => a.id !== id));
        }
    };

    const isCurrentSaved = generator.output ? savedAssets.some(a => a.id === `${generator.output?.spec_id}_v${generator.selectedImageIndex}`) : false;

    return (
        <div className="shell">
            <NavBar activePage={activePage} setActivePage={setActivePage} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
            <main className="main-content">
                {activePage === 'generate' ? (
                    <>
                        <ControlsPanel
                            userApiKey={userApiKey} setUserApiKey={setUserApiKey}
                            aspectRatio={generator.aspectRatio} setAspectRatio={generator.setAspectRatio}
                            mode={generator.mode} setMode={generator.setMode}
                            manualInputs={generator.manualInputs} setManualInputs={generator.setManualInputs}
                            jsonInput={generator.jsonInput} setJsonInput={generator.setJsonInput}
                            handleGenerate={generator.generateAsset}
                            isLoading={generator.isLoading}
                            isEditing={generator.isEditingImage}
                        />
                        <OutputPanel
                            isLoading={generator.isLoading}
                            loadingMessage={generator.loadingMessage}
                            error={generator.error}
                            output={generator.output}
                            generatedImages={generator.generatedImages}
                            selectedImageIndex={generator.selectedImageIndex}
                            setSelectedImageIndex={generator.setSelectedImageIndex}
                            formattedCaption={generator.formattedCaption}
                            isEditing={generator.isEditingImage}
                            handleEdit={generator.applyEdits}
                            onSave={handleSaveAsset}
                            isSaved={isCurrentSaved}
                            onView={() => setModalState({ isOpen: true })}
                        />
                    </>
                ) : (
                    <SavedAssetsGrid 
                        assets={savedAssets} 
                        onDelete={handleDeleteAsset} 
                        onView={(asset) => setModalState({ isOpen: true, asset })} 
                    />
                )}
            </main>
            <AssetModal 
                isOpen={modalState.isOpen} 
                onClose={() => setModalState({ isOpen: false })}
                asset={modalState.asset}
                currentImage={generatedImageUrl}
                currentOutput={generator.output}
                currentCaption={generator.formattedCaption}
            />
        </div>
    );
}
