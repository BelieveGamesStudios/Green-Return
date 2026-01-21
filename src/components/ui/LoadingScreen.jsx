import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-forest-50 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <LoadingSpinner size="lg" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="text-forest-600 font-medium"
                >
                    Loading Green Return...
                </motion.p>
            </div>
        </div>
    );
};

export default LoadingScreen;
