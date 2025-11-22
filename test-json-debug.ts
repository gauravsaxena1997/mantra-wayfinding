import { GenerationPipeline } from './services/generationPipeline';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const API_KEY = process.env.VITE_API_KEY;

if (!API_KEY) {
    console.error('Error: VITE_API_KEY not found');
    process.exit(1);
}

async function testJSONParsing() {
    const pipeline = new GenerationPipeline(API_KEY);

    const testInputs = {
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        source: 'Stanford Commencement Speech'
    };

    try {
        const result = await pipeline.run(
            'AUTO',
            testInputs,
            '',
            '9:16',
            { quotes: new Set<string>(), authors: [] },
            (msg) => console.log(`[Progress] ${msg}`),
            {
                generateImagePrompt: true,
                generateVideoPrompt: false,
                generateCaption: false,
                generateActualImage: false,
                numberOfImages: 1 as 1 | 2
            }
        );

        console.log('✅ SUCCESS! Generated valid JSON');

        // Write to file for inspection
        fs.writeFileSync('/tmp/generated-json.txt', result.spec.jsonImagePrompt || 'EMPTY');
        console.log('JSON saved to /tmp/generated-json.txt');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    }
}

testJSONParsing();
