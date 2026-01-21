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
export const extractBottleInfo = (text, knownBrands = COMMON_BRANDS) => {
    if (!text) return { rawText: '', identifiedBrand: null };

    // 1. Basic cleaning: remove excessive whitespace and non-alphanumeric chars (keep basic punctuation)
    const cleanText = text
        .replace(/[^a-zA-Z0-9\s.,-]/g, '') // Remove special chars
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .trim();

    // 2. Search for brands
    let bestMatch = null;
    const lowerText = cleanText.toLowerCase();

    // Prioritize dynamic known brands if provided, else fallback to common
    const targets = knownBrands.length > 0 ? knownBrands : COMMON_BRANDS;

    for (const brand of targets) {
        if (lowerText.includes(brand.toLowerCase())) {
            // Simple inclusion check. Could be promoted to fuzzy matching if needed.
            bestMatch = brand;
            break; // Return first match for now (heuristically usually the most prominent)
        }
    }

    return {
        rawText: cleanText,
        identifiedBrand: bestMatch
    };
};
