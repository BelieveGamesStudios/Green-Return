import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import { useStore } from '../lib/store';

const LeaderboardPage = () => {
    const navigate = useNavigate();
    const { user } = useStore();
    const [period, setPeriod] = useState('weekly');

    const mockUsers = [
        { id: 1, name: 'Sarah Green', points: 450, avatar: '🌱' },
        { id: 2, name: 'Mike Eco', points: 380, avatar: '♻️' },
        { id: 3, name: 'Jenny Leaf', points: 310, avatar: '🌿' },
        { id: 4, name: 'Tom Earth', points: 290, avatar: '🌍' },
        { id: 5, name: 'Eco Warrior (You)', points: user.totalPoints, avatar: '🦸', isUser: true },
        { id: 6, name: 'Lisa River', points: 200, avatar: '💧' },
    ];

    const sortedUsers = [...mockUsers].sort((a, b) => b.points - a.points);

    return (
        <div className="max-w-lg mx-auto md:max-w-2xl px-4 py-6 pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full bg-forest-100/10 hover:bg-forest-100/20 text-forest-900 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-forest-900">Leaderboard</h1>
            </div>

            {/* Toggle */}
            <div className="flex bg-white/10 p-1 rounded-full backdrop-blur-md">
                {['weekly', 'all-time'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${period === p ? 'bg-forest-500 text-white shadow-lg' : 'text-forest-800 hover:bg-white/10'
                            }`}
                    >
                        {p === 'weekly' ? 'Weekly' : 'All Time'}
                    </button>
                ))}
            </div>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 py-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">{sortedUsers[1].avatar}</div>
                    <div className="w-20 h-24 bg-forest-300/30 rounded-t-2xl flex flex-col items-center justify-end p-2 border-t border-x border-white/20">
                        <span className="font-bold text-forest-900">2</span>
                    </div>
                </div>
                {/* 1st Place */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                    <Crown className="text-amber-400 fill-amber-400 absolute -top-8 animate-bounce" size={24} />
                    <div className="text-4xl">{sortedUsers[0].avatar}</div>
                    <div className="w-24 h-32 bg-amber-400/30 rounded-t-2xl flex flex-col items-center justify-end p-2 border-t border-x border-amber-200/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                        <span className="font-bold text-forest-900 text-xl">1</span>
                    </div>
                </div>
                {/* 3rd Place */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">{sortedUsers[2].avatar}</div>
                    <div className="w-20 h-20 bg-forest-800/20 rounded-t-2xl flex flex-col items-center justify-end p-2 border-t border-x border-white/10">
                        <span className="font-bold text-forest-900">3</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {sortedUsers.map((u, index) => (
                    <GlassCard
                        key={u.id}
                        className={`
                            p-4 flex items-center justify-between
                            ${u.isUser ? 'border-amber-400/50 bg-amber-400/10' : ''}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <span className={`
                                w-8 h-8 flex items-center justify-center rounded-full font-bold
                                ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-forest-100/50 text-forest-700'}
                            `}>
                                {index + 1}
                            </span>
                            <span className="text-2xl">{u.avatar}</span>
                            <div>
                                <p className={`font-bold ${u.isUser ? 'text-amber-700' : 'text-forest-900'}`}>
                                    {u.name}
                                </p>
                                {u.isUser && <p className="text-xs text-amber-600 font-medium">That's you!</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-forest-900">{u.points}</p>
                            <p className="text-xs text-forest-600">pts</p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardPage;
