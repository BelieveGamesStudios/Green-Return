import { Share2, TreeDeciduous, Wind, Droplets, Medal, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { useStore } from '../lib/store';

const ImpactPage = () => {
    const navigate = useNavigate();
    const { user } = useStore();

    const handleShare = async () => {
        const text = `I've recycled ${user.bottlesScanned} bottles and saved ${user.impact.co2Saved.toFixed(1)}kg of CO2 with GreenReturn! 🌍♻️`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Green Impact',
                    text: text,
                    url: window.location.origin,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Stats copied to clipboard!');
        }
    };

    const badges = [
        { id: 'first-scan', icon: '🌱', name: 'First Step', desc: 'Scan your first bottle' },
        { id: 'streak-3', icon: '🔥', name: 'On Fire', desc: '3 day streak' },
        { id: 'streak-7', icon: '🚀', name: 'Unstoppable', desc: '7 day streak' },
        { id: 'bottle-50', icon: '🏆', name: 'Recycle Pro', desc: 'Recycle 50 bottles' },
        { id: 'bottle-100', icon: '👑', name: 'Eco King', desc: 'Recycle 100 bottles' },
    ];

    return (
        <div className="max-w-lg mx-auto md:max-w-2xl px-4 py-8 pb-24 space-y-8">
            <h1 className="text-3xl font-bold text-white text-center">Your Impact</h1>

            {/* Impact Stats */}
            <div className="grid grid-cols-1 gap-4">
                <GlassCard className="p-6 bg-gradient-to-br from-forest-500/10 to-forest-500/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-forest-100 rounded-full text-forest-600">
                            <Wind size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">CO2 Saved</p>
                            <p className="text-2xl font-bold text-white">{user.impact.co2Saved.toFixed(1)} kg</p>
                        </div>
                    </div>
                    <div className="w-full bg-forest-100 rounded-full h-2">
                        <div className="bg-forest-500 h-2 rounded-full" style={{ width: `${Math.min(user.impact.co2Saved * 10, 100)}%` }} />
                    </div>
                    <p className="text-xs text-white/80 mt-2 text-right">Goal: 10kg</p>
                </GlassCard>

                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <TreeDeciduous className="text-green-600" size={32} />
                            <div>
                                <p className="text-2xl font-bold text-white">{user.impact.treesPlanted.toFixed(1)}</p>
                                <p className="text-xs text-white">Trees Planted</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Droplets className="text-blue-500" size={32} />
                            <div>
                                <p className="text-2xl font-bold text-white">{user.impact.oceanPlastic}g</p>
                                <p className="text-xs text-white">Plastic Saved</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Share Button */}
            <GlassButton onClick={handleShare} className="w-full flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share My Impact
            </GlassButton>

            {/* Badges */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Medal className="text-amber-500" />
                    Achievements
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {badges.map((badge) => {
                        const isUnlocked = user.badges.includes(badge.id);
                        return (
                            <GlassCard
                                key={badge.id}
                                className={`p-3 text-center flex flex-col items-center gap-2 ${!isUnlocked ? 'opacity-50 grayscale' : 'border-amber-200 bg-amber-50/50'}`}
                            >
                                <div className="text-2xl relative">
                                    {badge.icon}
                                    {!isUnlocked && (
                                        <div className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-0.5">
                                            <Lock size={10} className="text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-xs">{badge.name}</p>
                                    <p className="text-[10px] text-white/80 leading-tight mt-1">{badge.desc}</p>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default ImpactPage;
