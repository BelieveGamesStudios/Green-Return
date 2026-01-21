import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import BottleScanner from '../components/scanner/BottleScanner';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';

const ScannerPage = () => {
    const navigate = useNavigate();
    const { addScan } = useStore();

    const handleScanComplete = (brand) => {
        // Update store
        const { streakChanged, newBadges } = addScan(10); // Assume 10 points per scan

        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#86efac', '#f0fdf4']
        });

        if (streakChanged) toast.success("Streak Increased! 🔥");
        if (newBadges.length > 0) {
            newBadges.forEach(b => toast.success(`Badge Unlocked: ${b.replace('-', ' ').toUpperCase()} 🏆`));
        }

        // Delay navigation to show success state
        setTimeout(() => {
            navigate('/results', { state: { brand } });
        }, 1500);
    };

    return (
        <div className="max-w-lg mx-auto md:max-w-2xl px-4 py-6 space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full bg-forest-100/10 hover:bg-forest-100/20 text-forest-900 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-forest-900">Scan Bottle</h1>
            </div>

            <div className="text-center space-y-2 mb-8">
                <p className="text-forest-800/70">
                    Align the bottle label within the frame to earn rewards.
                </p>
            </div>

            <BottleScanner onScanComplete={handleScanComplete} />

            <GlassCard className="p-4 mt-8 bg-amber-500/10 border-amber-500/20">
                <p className="text-sm text-center text-white">
                    <span className="font-bold text-amber-600">Tip:</span> Ensure good lighting and hold the camera steady for best results.
                </p>
            </GlassCard>
        </div>
    );
};

export default ScannerPage;
