import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
    persist(
        (set, get) => ({
            user: {
                name: 'Eco Warrior',
                totalPoints: 250,
                bottlesScanned: 12, // Starting mock data
                streak: 4,
                lastScanDate: new Date().toISOString(),
                badges: ['first-scan', 'streak-3'],
                impact: {
                    co2Saved: 0.6, // kg
                    oceanPlastic: 120, // g
                    treesPlanted: 0.6 // equivalent
                }
            },

            addScan: (points = 10) => {
                const state = get();
                const now = new Date();
                const lastScan = new Date(state.user.lastScanDate);
                const isToday = now.toDateString() === lastScan.toDateString();
                const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === lastScan.toDateString();

                // Streak Logic
                let newStreak = state.user.streak;
                if (!isToday) {
                    newStreak = isYesterday ? state.user.streak + 1 : 1;
                }

                // Impact Logic
                const newBottles = state.user.bottlesScanned + 1;
                const newCo2 = newBottles * 0.05;
                const newPlastic = newBottles * 10; // 10g per bottle

                // Badge Logic Check (simplified)
                const newBadges = [...state.user.badges];
                if (newStreak === 7 && !newBadges.includes('streak-7')) newBadges.push('streak-7');
                if (newBottles === 50 && !newBadges.includes('bottle-50')) newBadges.push('bottle-50');

                set((state) => ({
                    user: {
                        ...state.user,
                        totalPoints: state.user.totalPoints + points,
                        bottlesScanned: newBottles,
                        streak: newStreak,
                        lastScanDate: new Date().toISOString(),
                        badges: newBadges,
                        impact: {
                            co2Saved: newCo2,
                            oceanPlastic: newPlastic,
                            treesPlanted: newBottles / 20
                        }
                    }
                }));

                // Return info for toasts
                return {
                    streakChanged: !isToday && newStreak > state.user.streak,
                    newBadges: newBadges.filter(b => !state.user.badges.includes(b))
                };
            },
        }),
        {
            name: 'green-return-storage',
        }
    )
);
