import { Outlet, NavLink } from 'react-router-dom';
import { Home, Trophy, Camera, HeartHandshake, Briefcase } from 'lucide-react';
import Toast from '../ui/Toast';

const Layout = () => {
    return (
        <div className="min-h-screen bg-forest-50 text-forest-950 font-sans relative overflow-x-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-forest-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-forest-300/30 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen pb-20 md:pb-0">
                <main className="flex-grow p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
                <nav className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass-lg rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto">
                    <NavLink to="/" className={({ isActive }) => `p-2 rounded-full transition-all ${isActive ? 'bg-forest-500 text-white shadow-lg' : 'text-forest-700 hover:bg-white/10'}`}>
                        <Home size={24} />
                    </NavLink>
                    <NavLink to="/leaderboard" className={({ isActive }) => `p-2 rounded-full transition-all ${isActive ? 'bg-forest-500 text-white shadow-lg' : 'text-forest-700 hover:bg-white/10'}`}>
                        <Trophy size={24} />
                    </NavLink>
                    <NavLink to="/scan" className={({ isActive }) => `p-3 -mt-8 rounded-full transition-all border-4 border-forest-50 ${isActive ? 'bg-forest-600 text-white shadow-xl' : 'bg-forest-500 text-white shadow-lg'}`}>
                        <Camera size={28} />
                    </NavLink>
                    <NavLink to="/impact" className={({ isActive }) => `p-2 rounded-full transition-all ${isActive ? 'bg-forest-500 text-white shadow-lg' : 'text-forest-700 hover:bg-white/10'}`}>
                        <HeartHandshake size={24} />
                    </NavLink>
                    <NavLink to="/company" className={({ isActive }) => `p-2 rounded-full transition-all ${isActive ? 'bg-forest-500 text-white shadow-lg' : 'text-forest-700 hover:bg-white/10'}`}>
                        <Briefcase size={24} />
                    </NavLink>
                </nav>
            </div>

            <Toast />
        </div>
    );
};

export default Layout;
