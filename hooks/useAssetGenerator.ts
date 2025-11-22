
import { useState, useMemo, useEffect } from 'react';
import { GenerationPipeline } from '../services/generationPipeline';
import { GeminiService } from '../services/gemini';
import { AssetSpec, Mode } from '../types';
import { formatCaptionOutput } from '../utils';

export const useAssetGenerator = () => {
    const [mode, setMode] = useState<Mode>('AUTO');
    const [jsonInput, setJsonInput] = useState('');
    const [aspectRatio, setAspectRatio] = useState('9:16');

    // OUTPUT OPTIONS
    const [generateImagePrompt, setGenerateImagePrompt] = useState(true);
    const [generateVideoPrompt, setGenerateVideoPrompt] = useState(true);
    const [generateCaption, setGenerateCaption] = useState(true);
    const [generateActualImage, setGenerateActualImage] = useState(true);
    const [numberOfImages, setNumberOfImages] = useState<1 | 2>(2);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [output, setOutput] = useState<AssetSpec | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [formattedCaption, setFormattedCaption] = useState('');
    const [isEditingImage, setIsEditingImage] = useState(false);

    const [quoteHistory, setQuoteHistory] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem('mantraQuoteHistory') || '[]')); } 
        catch { return new Set(); }
    });
    const [authorHistory, setAuthorHistory] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('mantraAuthorHistory') || '[]'); } 
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('mantraQuoteHistory', JSON.stringify(Array.from(quoteHistory)));
        localStorage.setItem('mantraAuthorHistory', JSON.stringify(authorHistory));
    }, [quoteHistory, authorHistory]);

    const pipeline = useMemo(() => {
        const key = import.meta.env.VITE_API_KEY || '';
        if (!key) {
            console.error("VITE_API_KEY not found in environment variables! Add it to .env file.");
        }
        return new GenerationPipeline(key);
    }, []);

    const editingService = useMemo(() => {
        const key = import.meta.env.VITE_API_KEY || '';
        return new GeminiService(key);
    }, []);

    const generateAsset = async () => {
        console.log(`[UseAssetGenerator] Starting generation with .env API key`);
        console.log(`[Output Options] Image Prompt: ${generateImagePrompt}, Video Prompt: ${generateVideoPrompt}, Caption: ${generateCaption}, Actual Image: ${generateActualImage} (${numberOfImages} variations)`);

        setIsLoading(true);
        setError(null);
        setOutput(null);
        setGeneratedImages([]);
        setSelectedImageIndex(0);
        setFormattedCaption('');

        try {
            const { spec, images } = await pipeline.run(
                mode,
                { quote: '', author: '', source: '' }, // Not used in current modes
                jsonInput,
                aspectRatio,
                { quotes: quoteHistory, authors: authorHistory },
                (msg) => setLoadingMessage(msg),
                {
                    generateImagePrompt,
                    generateVideoPrompt,
                    generateCaption,
                    generateActualImage,
                    numberOfImages
                }
            );

            setOutput(spec);
            setGeneratedImages(images);
            if (spec.caption) {
                setFormattedCaption(formatCaptionOutput(spec));
            }

            setQuoteHistory(prev => new Set(prev).add(spec.quote.text));
            setAuthorHistory(prev => [spec.metadata.author, ...prev].slice(0, 10));

        } catch (e: any) {
            console.error(e);
            let friendlyError = `An error occurred: ${e.message}`;
            if (e.message?.includes('429')) friendlyError = "Quota limit reached. Use your own API Key or wait a minute.";
            if (e.message?.includes('403')) friendlyError = "Permission denied. Ensure your API Key is valid.";
            setError(friendlyError);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const applyEdits = async (prompt: string) => {
        const currentImage = generatedImages[selectedImageIndex];
        if (!currentImage || !prompt) return;
        
        setIsEditingImage(true);
        setError(null);
        try {
            const newImage = await editingService.editImage(currentImage, prompt, aspectRatio);
            setGeneratedImages(prev => {
                const newArr = [...prev];
                newArr[selectedImageIndex] = newImage;
                return newArr;
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsEditingImage(false);
        }
    };

    return {
        mode, setMode,
        jsonInput, setJsonInput,
        aspectRatio, setAspectRatio,

        // Output options
        generateImagePrompt, setGenerateImagePrompt,
        generateVideoPrompt, setGenerateVideoPrompt,
        generateCaption, setGenerateCaption,
        generateActualImage, setGenerateActualImage,
        numberOfImages, setNumberOfImages,

        isLoading, loadingMessage, error,
        output,
        generatedImages,
        selectedImageIndex, setSelectedImageIndex,
        formattedCaption,
        isEditingImage,
        generateAsset, applyEdits
    };
};
