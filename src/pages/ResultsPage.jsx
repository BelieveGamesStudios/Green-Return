import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Share2, Recycle, ArrowRight, CheckCircle, Plus, Minus, Coins, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { useStore } from '../lib/store';

const ResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addScan } = useStore();

    // State
    const [quantity, setQuantity] = useState(1);
    const [claimed, setClaimed] = useState(false);

    const brand = location.state?.brand || "Unknown Brand";
    const rewardPerBottle = 10; // Base points
    const totalReward = quantity * rewardPerBottle;

    useEffect(() => {
        if (!location.state?.brand) {
            // Check if accessing directly without scan
            // navigate('/scan'); 
        }
    }, [location, navigate]);

    const handleClaim = () => {
        const { streakChanged, newBadges } = addScan(rewardPerBottle, quantity);
        setClaimed(true);
        toast.success(`Allocated ${totalReward} points to your wallet!`);

        if (streakChanged) setTimeout(() => toast.success("Streak Increased! 🔥"), 500);
        if (newBadges.length > 0) {
            newBadges.forEach(b => setTimeout(() => toast.success(`Badge Unlocked: ${b.replace('-', ' ').toUpperCase()} 🏆`), 1000));
        }
    };

    const handleShare = async () => {
        const text = `I just earned ${totalReward} points by recycling ${quantity} ${brand} bottle${quantity > 1 ? 's' : ''} with Green Return!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Green Return',
                    text: text,
                    url: window.location.origin,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        }
    };

    return (
        <div className="max-w-lg mx-auto md:max-w-2xl px-4 py-8 pb-24 space-y-6">
            {/* Header */}
            {!claimed && (
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate('/scan')} className="p-2 rounded-full bg-forest-100/10 hover:bg-forest-100/20 text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Confirm Recycling</h1>
                </div>
            )}

            {/* Success Hero */}
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ring-4 ${claimed ? 'bg-amber-500/20 text-amber-500 ring-amber-500/10' : 'bg-forest-500/20 text-forest-500 ring-forest-500/10'}`}
                >
                    {claimed ? <Coins size={48} /> : <CheckCircle size={48} />}
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{claimed ? 'Points Added!' : 'Bottle Identified'}</h2>
                <p className="text-white/90 text-lg">{brand}</p>
            </div>

            {/* Quantity Selector (Only if not claimed) */}
            {!claimed ? (
                <GlassCard className="p-6">
                    <p className="text-center text-white font-medium mb-4">How many bottles?</p>
                    <div className="flex items-center justify-center gap-6">
                        <GlassButton
                            variant="secondary"
                            className="w-12 h-12 rounded-full !p-0 flex items-center justify-center"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Minus size={20} />
                        </GlassButton>
                        <span className="text-4xl font-bold text-white w-16 text-center">{quantity}</span>
                        <GlassButton
                            variant="secondary"
                            className="w-12 h-12 rounded-full !p-0 flex items-center justify-center"
                            onClick={() => setQuantity(Math.min(20, quantity + 1))}
                        >
                            <Plus size={20} />
                        </GlassButton>
                    </div>

                    <div className="mt-8 pt-6 border-t border-forest-100/20 flex justify-between items-center">
                        <span className="text-white font-medium">Potential Earnings</span>
                        <div className="flex items-center gap-2 text-2xl font-bold text-amber-600">
                            <Coins className="fill-amber-400 stroke-amber-600" size={24} />
                            +{totalReward}
                        </div>
                    </div>

                    <GlassButton onClick={handleClaim} className="w-full mt-6 py-4 text-lg shadow-xl shadow-forest-500/20">
                        Claim Reward
                    </GlassButton>
                </GlassCard>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8 text-center bg-gradient-to-br from-amber-100/50 to-amber-500/10 border-amber-200/30">
                        <p className="text-amber-800/60 uppercase tracking-widest text-xs font-bold mb-2">Total Earned</p>
                        <div className="text-6xl font-black text-amber-500 font-mono tracking-tighter mb-1">
                            +{totalReward}
                        </div>
                        <p className="text-amber-700 font-medium">Green Points</p>
                    </GlassCard>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <GlassButton variant="secondary" onClick={handleShare} className="py-4">
                            <Share2 size={20} /> Share
                        </GlassButton>
                        <GlassButton onClick={() => navigate('/scan')} className="py-4">
                            <Recycle size={20} /> Scan More
                        </GlassButton>
                    </div>
                </motion.div>
            )}

            {/* Map Section */}
            <GlassCard className="overflow-hidden p-0 h-40 relative group cursor-pointer mt-8">
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-forest-900/30">
                    <MapPin size={32} />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-4 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-forest-900">Nearest Collection Point</p>
                        <p className="text-xs text-forest-600">0.8 km away</p>
                    </div>
                    <GlassButton size="sm" onClick={() => window.open('https://maps.google.com', '_blank')}>
                        <Navigation size={16} />
                    </GlassButton>
                </div>
            </GlassCard>

            {claimed && (
                <GlassButton variant="ghost" onClick={() => navigate('/')} className="w-full text-forest-500">
                    Back to Home
                </GlassButton>
            )}
        </div>
    );
};

export default ResultsPage;
