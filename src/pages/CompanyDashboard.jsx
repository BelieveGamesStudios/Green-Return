import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, MapPin, Tag, Plus, Trash2,
    BarChart3, User, LogOut, Calendar, DollarSign, Upload, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createWorker } from 'tesseract.js';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { supabase } from '../lib/supabase';
import { resizeImage, blobToDataURL } from '../lib/imageUtils';
import { extractBottleInfo } from '../lib/scannerUtils';

// Sub-component for Bottle Management
const BottlesManager = ({ companyId }) => {
    const [bottles, setBottles] = useState([]);

    useEffect(() => {
        if (companyId) fetchBottles();
    }, [companyId]);

    const fetchBottles = async () => {
        const { data } = await supabase.from('bottles').select('*').order('created_at', { ascending: false });
        if (data) setBottles(data);
    };

    const handleAddBottle = async (e) => {
        e.preventDefault();
        if (!companyId) return;
        const form = new FormData(e.target);

        const newBottle = {
            company_id: companyId,
            name: form.get('name'),
            size: form.get('size'),
            barcode_pattern: form.get('pattern').toUpperCase()
        };

        const { data, error } = await supabase.from('bottles').insert(newBottle).select();
        if (error) {
            toast.error("Failed to add bottle");
        } else {
            setBottles([data[0], ...bottles]);
            toast.success("Bottle added to database!");
            e.target.reset();
        }
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-forest-500" />
                    Register New Bottle
                </h3>
                <form onSubmit={handleAddBottle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput name="name" label="Bottle Name" placeholder="e.g. Cola Classic" required />
                    <GlassInput name="size" label="Size" placeholder="e.g. 500ml" required />
                    <div className="md:col-span-2">
                        <GlassInput
                            name="pattern"
                            label="Recognition Keywords (OCR Pattern)"
                            placeholder="e.g. COCA-COLA|COKE"
                            required
                        />
                        <p className="text-xs text-forest-500 mt-1">Use | to separate keywords. Text found on the bottle label.</p>
                    </div>
                    <div className="md:col-span-2">
                        <GlassButton type="submit" className="w-full">Add Bottle to Database</GlassButton>
                    </div>
                </form>
            </GlassCard>

            <div className="space-y-4">
                {bottles.map((b) => (
                    <GlassCard key={b.id} className="p-4 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-forest-900">{b.name}</h4>
                            <p className="text-sm text-forest-600">{b.size} • Pattern: {b.barcode_pattern}</p>
                        </div>
                        <div className="text-xs bg-forest-100 text-forest-600 px-2 py-1 rounded-full">Active</div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

const CompanyDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('analytics');
    const [companyId, setCompanyId] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [locations, setLocations] = useState([
        { id: 1, name: 'Central Station', address: '123 Main St' },
        { id: 2, name: 'University Campus', address: '45 College Ave' },
    ]);

    // OCR and Image upload states
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [extractedBottleName, setExtractedBottleName] = useState('');
    const [bottleSize, setBottleSize] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCompanyData();
        }
    }, [isAuthenticated]);

    const fetchCompanyData = async () => {
        try {
            const { data: companies, error: compError } = await supabase
                .from('companies')
                .select('id, name')
                .limit(1);

            if (compError) throw compError;
            if (companies?.length > 0) {
                setCompanyId(companies[0].id);
                fetchCampaigns(companies[0].id);
            }
        } catch (err) {
            console.error('Error fetching company:', err);
            toast.error('Failed to load company data');
        }
    };

    const fetchCampaigns = async (id) => {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('company_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error);
        } else {
            const parsed = data.map(c => {
                let details = { bottles: [], image: null };
                try {
                    if (c.description && c.description.startsWith('{')) {
                        details = JSON.parse(c.description);
                    } else {
                        details = { bottles: [], image: null, text: c.description };
                    }
                } catch (e) {
                    details = { bottles: [], image: null, text: c.description };
                }
                return { ...c, ...details };
            });
            setCampaigns(parsed);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setIsAuthenticated(true);
        toast.success('Welcome back, Eco Corp!');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessingOCR(true);
        toast('Processing image with OCR...', { icon: '🔍' });

        try {
            // Resize and preview image
            const resizedBlob = await resizeImage(file, 1200);
            const previewUrl = await blobToDataURL(resizedBlob);
            setUploadedImage(previewUrl);

            // Run OCR
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(resizedBlob);
            await worker.terminate();

            // Extract bottle info
            const { identifiedBrand, rawText } = extractBottleInfo(text);

            if (identifiedBrand) {
                setExtractedBottleName(identifiedBrand);
                toast.success(`Detected: ${identifiedBrand}`);
            } else {
                // Use first meaningful word from raw text
                const words = rawText.split(' ').filter(w => w.length > 3);
                setExtractedBottleName(words[0] || 'Unknown Bottle');
                toast('Bottle name extracted (please verify)', { icon: '⚠️' });
            }

        } catch (err) {
            console.error('OCR Error:', err);
            toast.error('Failed to process image');
        } finally {
            setIsProcessingOCR(false);
        }
    };

    const handleAddCampaign = async (e) => {
        e.preventDefault();
        if (!companyId) return toast.error("No company ID found");
        if (!extractedBottleName) return toast.error("Please upload a bottle image first");

        const formData = new FormData(e.target);

        try {
            // 1. Create bottle record first
            const bottleData = {
                company_id: companyId,
                name: extractedBottleName,
                size: bottleSize || formData.get('size'),
                barcode_pattern: extractedBottleName.toUpperCase()
            };

            const { data: bottleRecord, error: bottleError } = await supabase
                .from('bottles')
                .insert(bottleData)
                .select()
                .single();

            if (bottleError) throw bottleError;

            // 2. Create campaign
            const newCampaign = {
                company_id: companyId,
                name: formData.get('name'),
                reward_amount: parseInt(formData.get('reward')),
                description: JSON.stringify({
                    bottles: [extractedBottleName],
                    image: uploadedImage,
                    bottle_id: bottleRecord.id
                }),
                status: 'Active',
                start_date: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('campaigns')
                .insert(newCampaign)
                .select();

            if (error) throw error;

            if (data) {
                const created = {
                    ...data[0],
                    bottles: [extractedBottleName],
                    image: uploadedImage
                };
                setCampaigns([created, ...campaigns]);
                toast.success('Campaign & Bottle created!');

                // Reset form
                e.target.reset();
                setUploadedImage(null);
                setExtractedBottleName('');
                setBottleSize('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Error creating campaign:', err);
            toast.error('Failed to create campaign');
        }
    };

    const handleDeleteCampaign = async (id) => {
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
            setCampaigns(campaigns.filter(c => c.id !== id));
            toast.success('Campaign deleted');
        } catch (err) {
            console.error('Error deleting:', err);
            toast.error('Failed to delete');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <GlassCard className="max-w-md w-full p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-forest-900">Partner Login</h1>
                        <p className="text-forest-700">Access your impact dashboard</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <GlassInput label="Email" type="email" placeholder="company@example.com" required />
                        <GlassInput label="Password" type="password" placeholder="••••••••" required />
                        <GlassButton type="submit" className="w-full">Sign In</GlassButton>
                    </form>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-forest-900">Dashboard</h1>
                    <p className="text-forest-700">Manage your eco-impact campaigns</p>
                </div>
                <div className="flex gap-2">
                    <GlassButton variant="secondary" size="sm" icon={<LogOut size={16} />} onClick={() => setIsAuthenticated(false)}>
                        Logout
                    </GlassButton>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 mb-6">
                <div className="flex gap-2 min-w-max">
                    {[
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'campaigns', label: 'Campaigns & Bottles', icon: Tag },
                        { id: 'locations', label: 'Collection Points', icon: MapPin },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${activeTab === tab.id
                                ? 'bg-forest-600 text-white shadow-lg shadow-forest-500/30'
                                : 'bg-white/10 text-forest-800 hover:bg-white/20 hover:text-forest-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <GlassCard className="p-6">
                                <p className="text-sm font-bold text-forest-500 uppercase">Total Scans</p>
                                <p className="text-4xl font-bold text-forest-900 mt-2">1,234</p>
                                <p className="text-xs text-forest-600 mt-1">+12% from last week</p>
                            </GlassCard>
                            <GlassCard className="p-6">
                                <p className="text-sm font-bold text-amber-500 uppercase">Rewards Claimed</p>
                                <p className="text-4xl font-bold text-forest-900 mt-2">$540</p>
                                <p className="text-xs text-forest-600 mt-1">54,000 points redeemed</p>
                            </GlassCard>
                            <GlassCard className="p-6">
                                <p className="text-sm font-bold text-blue-500 uppercase">Active Locations</p>
                                <p className="text-4xl font-bold text-forest-900 mt-2">{locations.length}</p>
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === 'campaigns' && (
                        <div className="space-y-6">
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-bold text-forest-900 mb-4 flex items-center gap-2">
                                    <Plus size={20} className="text-forest-500" />
                                    New Campaign & Bottle
                                </h3>
                                <form onSubmit={handleAddCampaign} className="space-y-4">
                                    {/* Image Upload Section */}
                                    <div className="border-2 border-dashed border-forest-200 rounded-xl p-6">
                                        <label className="block text-sm font-medium text-forest-900 mb-2">
                                            Step 1: Upload Bottle Image
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="bottle-image-upload"
                                            />
                                            <label
                                                htmlFor="bottle-image-upload"
                                                className="cursor-pointer bg-forest-500 hover:bg-forest-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <Upload size={16} />
                                                {uploadedImage ? 'Change Image' : 'Upload Image'}
                                            </label>
                                            {isProcessingOCR && (
                                                <div className="flex items-center gap-2 text-forest-600">
                                                    <Loader className="animate-spin" size={16} />
                                                    <span className="text-sm">Processing OCR...</span>
                                                </div>
                                            )}
                                        </div>

                                        {uploadedImage && (
                                            <div className="mt-4 flex gap-4">
                                                <img src={uploadedImage} alt="Uploaded bottle" className="w-32 h-32 object-cover rounded-lg border-2 border-forest-200" />
                                                <div className="flex-grow">
                                                    <p className="text-xs text-forest-600 mb-2">Extracted Information:</p>
                                                    <div className="bg-forest-50 p-3 rounded-lg">
                                                        <p className="text-sm font-medium text-forest-900">
                                                            Bottle Name: <span className="text-forest-600">{extractedBottleName || 'Processing...'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottle Details */}
                                    {extractedBottleName && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl">
                                            <div>
                                                <label className="block text-sm font-medium text-forest-900 mb-2">
                                                    Bottle Name (Auto-detected)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={extractedBottleName}
                                                    onChange={(e) => setExtractedBottleName(e.target.value)}
                                                    className="w-full bg-white/80 border border-forest-200 rounded-lg px-3 py-2 text-forest-900"
                                                />
                                            </div>
                                            <GlassInput
                                                name="size"
                                                label="Bottle Size"
                                                placeholder="e.g. 500ml"
                                                value={bottleSize}
                                                onChange={(e) => setBottleSize(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Campaign Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <GlassInput name="name" label="Campaign Name" placeholder="e.g. Summer Recycle 2024" required />
                                        <GlassInput name="reward" label="Reward Points" type="number" placeholder="50" required />
                                    </div>

                                    <div className="flex gap-2">
                                        <GlassButton
                                            type="submit"
                                            className="flex-grow"
                                            disabled={!extractedBottleName || isProcessingOCR}
                                        >
                                            Create Campaign & Bottle
                                        </GlassButton>
                                    </div>
                                </form>
                            </GlassCard>

                            <div className="space-y-4">
                                {campaigns.map((camp) => (
                                    <GlassCard key={camp.id} className="p-4 flex items-center gap-4">
                                        {camp.image ? (
                                            <img src={camp.image} alt={camp.name} className="w-16 h-16 rounded-xl object-cover bg-forest-50" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-forest-100 flex items-center justify-center text-forest-500">
                                                <Tag size={24} />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-forest-900">{camp.name}</h4>
                                                    <p className="text-xs text-forest-600">Bottles: {camp.bottles.join(', ')}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-sm text-forest-600">
                                                <span className="flex items-center gap-1 font-bold text-amber-600">
                                                    <DollarSign size={14} /> {camp.reward_amount || camp.reward} pts
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {camp.status}
                                                </span>
                                            </div>
                                        </div>
                                        <GlassButton variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => handleDeleteCampaign(camp.id)} />
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'locations' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-6 h-fit">
                                    <h3 className="text-lg font-bold text-forest-900 mb-4">Add Collection Point</h3>
                                    <div className="space-y-4">
                                        <GlassInput label="Location Name" placeholder="Station Name" />
                                        <GlassInput label="Address" placeholder="Full Address" />
                                        <div className="h-32 bg-forest-50 rounded-xl border border-dotted border-forest-300 flex items-center justify-center text-forest-400">
                                            Map Picker Placeholder
                                        </div>
                                        <GlassButton>Add Location</GlassButton>
                                    </div>
                                </GlassCard>
                                <div className="space-y-4">
                                    {locations.map((loc) => (
                                        <GlassCard key={loc.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-forest-900">{loc.name}</h4>
                                                        <p className="text-sm text-forest-600">{loc.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CompanyDashboard;
