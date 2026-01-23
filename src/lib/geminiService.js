import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Extracts bottle text information from an image using Gemini AI
 * @param {File|Blob} imageFile - The image file to analyze
 * @returns {Promise<{bottleName: string, size: string, confidence: string}>}
 */
export async function extractBottleTextWithGemini(imageFile) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Verify API key is loaded
    console.log('🤖 Gemini API Key Status:', apiKey ? '✅ Loaded' : '❌ Not found');

    if (!apiKey) {
        throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
        // Initialize Gemini AI
        console.log('🚀 Initializing Gemini AI (gemini-1.5-flash)...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Convert image to base64
        const imageData = await fileToGenerativePart(imageFile);

        // Create prompt for bottle text extraction
        const prompt = `You are analyzing a bottle or beverage container image. Extract the following information:
1. Brand Name: The main brand or product name visible on the label
2. Size: The volume or size of the container (e.g., 500ml, 1L, 12oz)

Return the information in this exact JSON format:
{
  "bottleName": "extracted brand name",
  "size": "extracted size",
  "confidence": "high/medium/low"
}

If you cannot find certain information, use "Unknown" for that field. Set confidence to:
- "high" if the text is clear and easily readable
- "medium" if the text is somewhat visible but unclear
- "low" if the text is barely visible or unclear

Only return the JSON, no additional text.`;

        // Generate content
        console.log('📤 Sending image to Gemini AI for analysis...');
        const geminiResult = await model.generateContent([prompt, imageData]);
        const response = await geminiResult.response;
        const text = response.text();
        console.log('📥 Gemini AI Response:', text);

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse Gemini response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        const extractedData = {
            bottleName: parsed.bottleName || 'Unknown Bottle',
            size: parsed.size || '',
            confidence: parsed.confidence || 'low'
        };

        console.log('✅ Gemini Extraction Success:', extractedData);
        return extractedData;

    } catch (error) {
        console.error('Gemini extraction error:', error);
        throw new Error(`Failed to extract text with Gemini: ${error.message}`);
    }
}

/**
 * Converts a File/Blob to the format required by Gemini API
 * @param {File|Blob} file
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1]; // Remove data:image/xxx;base64, prefix
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || 'image/jpeg'
                }
            });
        };

        reader.onerror = () => {
            reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(file);
    });
}
