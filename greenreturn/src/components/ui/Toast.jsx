import { Toaster } from 'react-hot-toast';

const Toast = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 3000,
                className: '!bg-white/20 !backdrop-blur-xl !border !border-white/10 !text-forest-950 dark:!text-white !rounded-2xl !shadow-glass !px-4 !py-3',
                success: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: 'white',
                    },
                    style: {
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: 'white',
                    },
                    style: {
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    },
                },
                loading: {
                    style: {
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                },
            }}
        />
    );
};

export default Toast;
