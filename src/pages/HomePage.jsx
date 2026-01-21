import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, DollarSign, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import BottleScanner from '../components/scanner/BottleScanner';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const [scannedBottle, setScannedBottle] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [trendingCampaigns, setTrendingCampaigns] = useState([]);
    const [topBottles, setTopBottles] = useState([]);

    // Fetch trending campaigns and top bottles
    useEffect(() => {
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        try {
            // Fetch campaigns ordered by reward
            const { data: campaigns } = await supabase
                .from('campaigns')
                .select('*')
                .eq('status', 'Active')
                .order('reward_amount', { ascending: false })
                .limit(5);

            if (campaigns) {
                const parsed = campaigns.map(c => {
                    let details = { bottles: [], image: null };
                    try {
                        if (c.description && c.description.startsWith('{')) {
                            details = JSON.parse(c.description);
                        }
                    } catch (e) { }
                    return { ...c, ...details };
                });
                setTrendingCampaigns(parsed);
            }

            // Fetch top bottles (mock for now, would need analytics in real app)
            const { data: bottles } = await supabase
                .from('bottles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (bottles) setTopBottles(bottles);
        } catch (err) {
            console.error('Error fetching leaderboards:', err);
        }
    };

    const handleScanComplete = (bottleName) => {
        setScannedBottle(bottleName);

        // Check if user is authenticated
        if (!user || user.totalPoints === undefined) {
            // Show auth modal
            setShowAuthModal(true);
        } else {
            // Proceed to results
            navigate('/results', { state: { brand: bottleName } });
        }
    };

    const handleSignIn = () => {
        navigate('/customer');
    };

    const handleSignUp = () => {
        navigate('/customer');
    };

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
            {/* Scanner Section */}
            <section className="pt-4">
                <div className="text-center space-y-2 mb-6">
                    <h1 className="text-4xl font-bold text-white">
                        Green Return
                    </h1>
                    <p className="text-white/70">
                        Scan a bottle to start earning rewards
                    </p>
                </div>

                <BottleScanner onScanComplete={handleScanComplete} />
            </section>

            {/* Trending Campaigns */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <TrendingUp className="text-white" size={24} />
                    <h3 className="text-lg font-semibold text-white">Trending Campaigns</h3>
                </div>
                <div className="space-y-3">
                    {trendingCampaigns.map((campaign) => (
                        <GlassCard key={campaign.id} className="p-4">
                            <div className="flex items-center gap-4">
                                {campaign.image ? (
                                    <img src={campaign.image} alt={campaign.name} className="w-16 h-16 rounded-lg object-cover bg-white" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                                        <TrendingUp className="text-white" size={24} />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <h4 className="font-bold text-white text-lg">{campaign.name}</h4>
                                    <p className="text-sm text-forest-200 font-medium">
                                        {campaign.bottles && campaign.bottles.length > 0
                                            ? campaign.bottles.join(', ')
                                            : 'Multiple bottles'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-amber-500">{campaign.reward_amount}</p>
                                    <p className="text-xs text-white font-semibold">points</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                    {trendingCampaigns.length === 0 && (
                        <div className="text-center py-8 text-forest-500 font-medium">
                            <p>No campaigns available yet</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Highest Paying Bottles */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Trophy className="text-amber-600" size={24} />
                    <h3 className="text-lg font-semibold text-white">Highest Paying Bottles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topBottles.map((bottle, index) => (
                        <GlassCard key={bottle.id} className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                #{index + 1}
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-white text-base">{bottle.name}</h4>
                                <p className="text-sm text-forest-200 font-medium">{bottle.size}</p>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <DollarSign size={16} />
                                <span>50pts</span>
                            </div>
                        </GlassCard>
                    ))}
                    {topBottles.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-forest-200 font-medium">
                            <p>No bottles registered yet</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative"
                        >
                            <GlassCard className="max-w-md w-full p-8 space-y-6">
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="absolute top-4 right-4 text-white hover:text-white/70"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Great Find!</h2>
                                    <p className="text-white/80">
                                        We detected <span className="font-bold text-white">{scannedBottle}</span>
                                    </p>
                                    <p className="text-sm text-white/60">
                                        Sign in or create an account to claim your rewards
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <GlassButton onClick={handleSignIn} className="w-full py-3">
                                        Sign In
                                    </GlassButton>
                                    <GlassButton onClick={handleSignUp} variant="secondary" className="w-full py-3">
                                        Create Account
                                    </GlassButton>
                                </div>

                                <div className="text-center">
                                    <button
                                        className="text-sm text-white hover:text-forest-200 underline"
                                    >
                                        Continue without account
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;
