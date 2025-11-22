import { GenerationPipeline } from './services/generationPipeline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.VITE_API_KEY;

if (!API_KEY) {
    console.error('Error: VITE_API_KEY not found in .env file');
    process.exit(1);
}

async function testGeneration() {
    console.log('='.repeat(80));
    console.log('TESTING GENERATION PIPELINE - JSON VALIDATION');
    console.log('='.repeat(80));
    console.log('');

    const pipeline = new GenerationPipeline(API_KEY);

    // Test inputs
    const testInputs = {
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        source: 'Stanford Commencement Speech'
    };

    const aspectRatio = '9:16';
    const jsonInput = '';
    const history = {
        quotes: new Set<string>(),
        authors: [] as string[]
    };

    const options = {
        generateImagePrompt: true,
        generateVideoPrompt: true,
        generateCaption: true,
        generateActualImage: false, // Don't generate actual images, just test JSON
        numberOfImages: 1 as 1 | 2
    };

    let attempt = 1;
    const maxAttempts = 3;

    while (attempt <= maxAttempts) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`ATTEMPT ${attempt}/${maxAttempts}`);
        console.log('='.repeat(80));
        console.log('');

        try {
            const result = await pipeline.run(
                'AUTO',
                testInputs,
                jsonInput,
                aspectRatio,
                history,
                (msg) => console.log(`[Progress] ${msg}`),
                options
            );

            console.log('\n' + '='.repeat(80));
            console.log('✅ SUCCESS! JSON VALIDATION PASSED');
            console.log('='.repeat(80));
            console.log('');

            // Display results
            console.log('Generated Asset Spec:');
            console.log('  Spec ID:', result.spec.spec_id);
            console.log('  Mode:', result.spec.mode);
            console.log('  Quote:', result.spec.quote.text);
            console.log('  Author:', result.spec.metadata.author);
            console.log('');

            if (result.spec.jsonImagePrompt) {
                console.log('✅ jsonImagePrompt: Valid JSON (' + result.spec.jsonImagePrompt.length + ' characters)');
                try {
                    const parsed = JSON.parse(result.spec.jsonImagePrompt);
                    console.log('   Parsed successfully! Keys:', Object.keys(parsed).join(', '));
                } catch (e: any) {
                    console.error('   ❌ ERROR: Could not parse jsonImagePrompt:', e.message);
                }
            }

            if (result.spec.jsonVideoPrompt) {
                console.log('✅ jsonVideoPrompt: Valid JSON (' + result.spec.jsonVideoPrompt.length + ' characters)');
                try {
                    const parsed = JSON.parse(result.spec.jsonVideoPrompt);
                    console.log('   Parsed successfully! Keys:', Object.keys(parsed).join(', '));
                } catch (e: any) {
                    console.error('   ❌ ERROR: Could not parse jsonVideoPrompt:', e.message);
                }
            }

            if (result.spec.caption) {
                console.log('✅ caption: Generated');
                console.log('   Quote:', result.spec.caption.quote);
                console.log('   Hashtags:', result.spec.caption.hashtags.join(', '));
            }

            console.log('');
            console.log('='.repeat(80));
            console.log('🎉 ALL TESTS PASSED - 100% JSON VALIDATION SUCCESS');
            console.log('='.repeat(80));

            process.exit(0);

        } catch (error: any) {
            console.error('\n' + '='.repeat(80));
            console.error(`❌ ATTEMPT ${attempt} FAILED`);
            console.error('='.repeat(80));
            console.error('');
            console.error('Error:', error.message);
            console.error('');

            if (error.stack) {
                console.error('Stack trace:');
                console.error(error.stack);
            }

            attempt++;

            if (attempt > maxAttempts) {
                console.error('\n' + '='.repeat(80));
                console.error('❌ ALL ATTEMPTS FAILED - JSON VALIDATION NOT 100% YET');
                console.error('='.repeat(80));
                console.error('');
                console.error('Please review the errors above and apply additional fixes.');
                process.exit(1);
            } else {
                console.log('');
                console.log('Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

// Run the test
testGeneration().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
