import { useState, useRef, useEffect, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, X, RefreshCw, CheckCircle, AlertCircle, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import LoadingSpinner from '../ui/LoadingSpinner';
import { resizeImage, blobToDataURL } from '../../lib/imageUtils';
import { extractBottleInfo } from '../../lib/scannerUtils';

/**
 * BottleScanner Component
 * @param {Object} props
 * @param {Function} props.onScanComplete - Callback with { brand: string, confidence: string }
 */
const BottleScanner = ({ onScanComplete = () => { } }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);
    const workerRef = useRef(null);

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processImage(file);
    };

    const processImage = async (file) => {
        setError(null);
        setScanResult(null);
        setIsScanning(true);
        setProgress(10); // Start progress immediately

        try {
            // 1. Preprocess Image
            const resizedBlob = await resizeImage(file, 1200);
            const previewUrl = await blobToDataURL(resizedBlob);
            setImagePreview(previewUrl);

            // 2. Initialize Worker if needed
            if (!workerRef.current) {
                console.log("Creating new worker...");
                // Tesseract v5: createWorker('eng') handles load/init automatically
                const worker = await createWorker('eng');
                workerRef.current = worker;
            }

            setProgress(30);

            // 3. Run OCR with timeout race
            const ocrPromise = workerRef.current.recognize(resizedBlob);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Scan timed out")), 15000)
            );

            const { data: { text } } = await Promise.race([ocrPromise, timeoutPromise]);

            setProgress(90);

            // 4. Extract Info
            const { identifiedBrand, rawText } = extractBottleInfo(text);

            if (identifiedBrand) {
                setScanResult({ brand: identifiedBrand, raw: rawText });
                onScanComplete(identifiedBrand);
                toast.success(`Identified: ${identifiedBrand}`);
            } else {
                setScanResult({ brand: null, raw: rawText });
                setError("Could not identify a known brand. Please try again.");
            }

        } catch (err) {
            console.error("Scanning Error:", err);
            const errorMessage = err.message || "Failed to process image";
            setError(`Scanning failed: ${errorMessage}`);
            toast.error("Scanning failed");

            // Force reset worker on error
            if (workerRef.current) {
                await workerRef.current.terminate();
                workerRef.current = null;
            }
        } finally {
            setIsScanning(false);
            setProgress(0); // Reset progress
        }
    };

    const resetScanner = () => {
        setImagePreview(null);
        setScanResult(null);
        setError(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drag and Drop handlers
    const onDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    }, []);

    return (
        <GlassCard className="max-w-md w-full mx-auto p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-forest-50 dark:text-white flex items-center gap-2">
                    <ScanLine className="text-forest-400" />
                    Bottle Scanner
                </h2>
                {imagePreview && (
                    <button onClick={resetScanner} className="text-white/60 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!imagePreview ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors hover:border-forest-400/50 hover:bg-white/5 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment" // Opens camera on mobile
                            onChange={handleFileSelect}
                        />

                        <div className="w-16 h-16 rounded-full bg-forest-500/20 flex items-center justify-center">
                            <Camera size={32} className="text-forest-400" />
                        </div>

                        <div>
                            <p className="font-medium text-white">Tap to Capture</p>
                            <p className="text-sm text-white/50">or drag and drop execution image</p>
                        </div>

                        <GlassButton variant="secondary" size="sm" icon={<Upload size={16} />}>
                            Select File
                        </GlassButton>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black/50"
                    >
                        <img src={imagePreview} alt="Scan preview" className="w-full h-full object-contain" />

                        {/* Scanning Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                                <div className="relative w-full h-1 bg-forest-500/50 shadow-[0_0_15px_#22c55e]">
                                    <motion.div
                                        className="w-full h-full bg-forest-400"
                                        animate={{ y: [0, 200, 0] }} // Simple vertical scan loop
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    />
                                </div>

                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-white font-medium mt-2">Scanning...</p>
                                    <p className="text-white/60 text-sm">{progress}%</p>
                                </div>
                            </div>
                        )}

                        {/* Results Overlay */}
                        {!isScanning && scanResult && (
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-12">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <div className="flex items-start gap-3">
                                        {scanResult.brand ? (
                                            <CheckCircle className="text-forest-400 shrink-0 mt-1" />
                                        ) : (
                                            <AlertCircle className="text-yellow-400 shrink-0 mt-1" />
                                        )}
                                        <div>
                                            <p className="text-sm text-white/60 uppercase tracking-wider font-bold">
                                                {scanResult.brand ? 'Bottle Identified' : 'Not Recognized'}
                                            </p>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {scanResult.brand || "Unknown Brand"}
                                            </h3>
                                            {!scanResult.brand && (
                                                <p className="text-xs text-white/50 mb-3">
                                                    Raw text: "{scanResult.raw?.substring(0, 50)}..."
                                                </p>
                                            )}

                                            {!scanResult.brand && (
                                                <GlassButton size="sm" variant="ghost" onClick={resetScanner} className="w-full mt-2">
                                                    <RefreshCw size={16} /> Try Again
                                                </GlassButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Overlay */}
                        {!isScanning && error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                                <div>
                                    <AlertCircle className="text-red-400 w-12 h-12 mx-auto mb-2" />
                                    <p className="text-white font-medium mb-4">{error}</p>
                                    <GlassButton onClick={resetScanner}>Try Again</GlassButton>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

export default BottleScanner;
