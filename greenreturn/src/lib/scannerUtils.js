/**
 * Common beverage brands to assist with fuzzy matching or prioritization.
 */
export const COMMON_BRANDS = [
    'Coca-Cola', 'Coke', 'Pepsi', 'Fanta', 'Sprite', 'Dr Pepper',
    'Mountain Dew', '7UP', 'Lipton', 'Nestea', 'Gatorade',
    'Powerade', 'Red Bull', 'Monster', 'Evian', 'Volvic',
    'Dasani', 'Aquafina', 'Perrier', 'San Pellegrino',
    'Heineken', 'Guinness', 'Corona', 'Budweiser', 'Carlsberg'
];

/**
 * Cleans OCR output and attempts to identify a brand name.
 * @param {string} text - Raw OCR text
 * @returns {Object} result - { rawText: string, identifiedBrand: string | null, confidence: string }
 */
export const extractBottleInfo = (text) => {
    if (!text) return { rawText: '', identifiedBrand: null };

    // 1. Basic cleaning: remove excessive whitespace and non-alphanumeric chars (keep basic punctuation)
    const cleanText = text
        .replace(/[^a-zA-Z0-9\s.,-]/g, '') // Remove special chars
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .trim();

    // 2. Search for brands
    let bestMatch = null;
    const lowerText = cleanText.toLowerCase();

    for (const brand of COMMON_BRANDS) {
        if (lowerText.includes(brand.toLowerCase())) {
            // Simple inclusion check. Could be promoted to fuzzy matching if needed.
            bestMatch = brand;
            break; // Return first match for now (heuristically usually the most prominent)
        }
    }

    // 3. Fallback: If no brand found, maybe return the longest word or first capitalized line? 
    // For now, we just return null if no known brand found, 
    // letting the UI ask the user to confirm or edit.

    return {
        rawText: cleanText,
        identifiedBrand: bestMatch
    };
};
