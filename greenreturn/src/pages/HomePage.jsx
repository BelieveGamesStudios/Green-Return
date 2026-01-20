import { motion } from 'framer-motion';
import { Camera, RefreshCw, Coins, ArrowRight, History, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { useStore } from '../lib/store';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useStore();

    // Stats from store
    const stats = {
        todayScans: user.bottlesScanned, // Using total instead of today for now (simplification)
        availableRewards: user.totalPoints,
    };

    const recentScans = [
        { id: 1, name: 'Cola Zero', points: 10, time: '2h ago' },
        { id: 2, name: 'Water Bottle', points: 5, time: '4h ago' },
        { id: 3, name: 'Iced Tea', points: 8, time: '1d ago' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-32 h-32 mx-auto bg-forest-100/10 rounded-full flex items-center justify-center border border-forest-200/20 shadow-glass-lg"
                >
                    <motion.div
                        animate={{ rotate: 10 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                    >
                        <RefreshCw size={64} className="text-forest-500" />
                    </motion.div>
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-forest-600 to-forest-800 bg-clip-text text-transparent">
                        Green Return
                    </h1>

                    {/* Streak Counter */}
                    <div className="flex items-center justify-center gap-1 text-orange-500 font-bold">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Flame size={20} className="fill-orange-500" />
                        </motion.div>
                        <span>{user.streak} Day Streak</span>
                    </div>

                    <p className="text-forest-800/70 text-lg">
                        Recycle bottles, earn rewards, save the planet.
                    </p>
                </div>

                <GlassButton
                    onClick={() => navigate('/scan')}
                    className="px-8 py-4 text-xl font-bold w-full md:w-auto shadow-xl shadow-forest-500/20"
                >
                    <div className="flex items-center gap-3">
                        <Camera size={24} />
                        Scan a Bottle
                    </div>
                </GlassButton>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 gap-4">
                <GlassCard className="p-6 text-center space-y-1">
                    <p className="text-forest-900/60 text-sm font-medium">Total Bottles</p>
                    <p className="text-3xl font-bold text-forest-700">{user.bottlesScanned}</p>
                </GlassCard>
                <GlassCard className="p-6 text-center space-y-1">
                    <p className="text-forest-900/60 text-sm font-medium">Total Points</p>
                    <div className="flex items-center justify-center gap-1 text-3xl font-bold text-amber-600">
                        <Coins size={24} className="fill-amber-400 stroke-amber-600" />
                        {user.totalPoints}
                    </div>
                </GlassCard>
            </section>

            {/* How It Works */}
            <section>
                <h3 className="text-lg font-semibold text-forest-900 mb-4 px-2">How it works</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { icon: Camera, title: "Scan", desc: "Scan the bottle label" },
                        { icon: RefreshCw, title: "Recycle", desc: "Drop it at a collection point" },
                        { icon: Coins, title: "Earn", desc: "Get rewards instantly" }
                    ].map((step, idx) => (
                        <GlassCard key={idx} className="p-4 flex items-center gap-4 md:flex-col md:text-center md:py-6">
                            <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 shrink-0">
                                <step.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-forest-900">{step.title}</h4>
                                <p className="text-sm text-forest-700/70">{step.desc}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* Recent Scans (Carousel-like) */}
            <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-semibold text-forest-900">Recent Scans</h3>
                    <GlassButton variant="secondary" className="!px-3 !py-1 text-xs">View All</GlassButton>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
                    {recentScans.map((scan) => (
                        <GlassCard key={scan.id} className="min-w-[140px] p-4 flex flex-col gap-2 snap-start">
                            <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-400 mb-2">
                                <History size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-forest-900 text-sm truncate">{scan.name}</p>
                                <p className="text-xs text-forest-500">{scan.time}</p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-bold text-amber-600">
                                <Coins size={12} className="fill-amber-400" />
                                +{scan.points}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
