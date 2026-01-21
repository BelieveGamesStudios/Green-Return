/**
 * Haptic feedback utility using navigator.vibrate
 */

export const vibrate = (pattern = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

export const haptics = {
    light: () => vibrate(5),
    medium: () => vibrate(10),
    heavy: () => vibrate([10, 50, 10]),
    success: () => vibrate([10, 30, 10, 30]),
    error: () => vibrate([50, 100, 50]),
};
