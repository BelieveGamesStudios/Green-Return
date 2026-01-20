/**
 * Resizes an image file to a maximum width while maintaining aspect ratio.
 * Compresses to JPEG at 80% quality.
 * @param {File} file - The image file to process
 * @param {number} maxWidth - Maximum width in pixels (default 1200)
 * @returns {Promise<Blob>} - Processed image blob
 */
export const resizeImage = (file, maxWidth = 1200) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const scaleFactor = maxWidth / img.width;

                // Only resize if image is larger than maxWidth
                if (scaleFactor < 1) {
                    elem.width = maxWidth;
                    elem.height = img.height * scaleFactor;
                } else {
                    elem.width = img.width;
                    elem.height = img.height;
                }

                const ctx = elem.getContext('2d');
                ctx.drawImage(img, 0, 0, elem.width, elem.height);

                // Convert to blob (JPEG 80% quality)
                ctx.canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Converts a Blob to a Data URL (base64 string) for preview.
 * @param {Blob} blob 
 * @returns {Promise<string>}
 */
export const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
