import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, Leaf, TrendingUp, Award, Coins, Recycle, LogOut } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { useStore } from '../lib/store';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsAuthenticated(true);
        toast.success('Welcome back!');
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <GlassCard className="max-w-md w-full p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-forest-900">User Login</h1>
                        <p className="text-forest-700">Access your recycling dashboard</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <GlassInput label="Email" type="email" placeholder="user@example.com" required />
                        <GlassInput label="Password" type="password" placeholder="••••••••" required />
                        <GlassButton type="submit" className="w-full">Sign In</GlassButton>
                    </form>
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/company')}
                            className="text-sm text-forest-600 hover:text-forest-900"
                        >
                            Are you a partner? Sign in here
                        </button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-forest-900">My Dashboard</h1>
                    <p className="text-forest-700">Welcome back, {user.name}!</p>
                </div>
                <div className="flex gap-2">
                    <GlassButton onClick={() => navigate('/scan')} size="sm">
                        <Recycle size={16} /> Scan Bottle
                    </GlassButton>
                    <GlassButton variant="secondary" size="sm" icon={<LogOut size={16} />} onClick={() => setIsAuthenticated(false)}>
                        Logout
                    </GlassButton>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-forest-100 rounded-lg">
                            <Recycle className="text-forest-600" size={24} />
                        </div>
                        <p className="text-sm font-bold text-forest-500 uppercase">Total Scans</p>
                    </div>
                    <p className="text-4xl font-bold text-forest-900">{user.bottlesScanned}</p>
                    <p className="text-xs text-forest-600 mt-1">Bottles recycled</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Coins className="text-amber-600 fill-amber-400" size={24} />
                        </div>
                        <p className="text-sm font-bold text-amber-500 uppercase">Total Points</p>
                    </div>
                    <p className="text-4xl font-bold text-forest-900">{user.totalPoints}</p>
                    <p className="text-xs text-forest-600 mt-1">Available to redeem</p>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Flame className="text-orange-600" size={24} />
                        </div>
                        <p className="text-sm font-bold text-orange-500 uppercase">Streak</p>
                    </div>
                    <p className="text-4xl font-bold text-forest-900">{user.streak}</p>
                    <p className="text-xs text-forest-600 mt-1">Days in a row!</p>
                </GlassCard>
            </div>

            {/* Impact Stats */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <Leaf className="text-green-600" size={24} />
                    Your Environmental Impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-3xl font-black text-green-600">{user.impact.co2Saved.toFixed(2)} kg</p>
                        <p className="text-sm text-forest-700 mt-1">CO₂ Saved</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-3xl font-black text-blue-600">{user.impact.oceanPlastic} g</p>
                        <p className="text-sm text-forest-700 mt-1">Ocean Plastic Prevented</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-3xl font-black text-emerald-600">{user.impact.treesPlanted.toFixed(1)}</p>
                        <p className="text-sm text-forest-700 mt-1">Trees Equivalent</p>
                    </div>
                </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <Trophy className="text-amber-600" size={24} />
                    Achievements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user.badges.map((badge) => (
                        <motion.div
                            key={badge}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl text-center border-2 border-amber-300"
                        >
                            <Award className="mx-auto text-amber-600 mb-2" size={32} />
                            <p className="text-xs font-bold text-amber-900">{badge.replace('-', ' ').toUpperCase()}</p>
                        </motion.div>
                    ))}

                    {/* Locked badges */}
                    {[...Array(4 - user.badges.length)].map((_, i) => (
                        <div
                            key={`locked-${i}`}
                            className="bg-gray-100 p-4 rounded-xl text-center border-2 border-gray-200 opacity-50"
                        >
                            <Award className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-xs font-bold text-gray-500">LOCKED</p>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-forest-600" size={24} />
                    Recent Activity
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-forest-50 rounded-lg">
                        <div>
                            <p className="font-medium text-forest-900">Last scan</p>
                            <p className="text-sm text-forest-600">{new Date(user.lastScanDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-amber-600">+10 pts</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default UserDashboard;
