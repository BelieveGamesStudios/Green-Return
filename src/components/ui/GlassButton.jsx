import { motion } from 'framer-motion';

const GlassButton = ({ children, className = '', variant = 'primary', ...props }) => {
    const variants = {
        primary: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
        secondary: 'bg-black/20 hover:bg-black/30 text-white border-white/10',
        accent: 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/20',
    };

    return (
        <motion.button
            className={`
        px-6 py-3 rounded-xl
        backdrop-blur-lg border
        font-semibold transition-all duration-300
        ${variants[variant]}
        ${className}
      `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default GlassButton;
