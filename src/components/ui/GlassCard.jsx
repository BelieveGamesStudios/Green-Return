import { motion } from 'framer-motion';

/**
 * GlassCard Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.hoverEffect=false]
 */
const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <motion.div
            className={`
        relative overflow-hidden rounded-3xl
        bg-white/80 dark:bg-gray-800/90
        backdrop-blur-xl border-2 border-gray-300/50
        shadow-glass-lg
        ${className}
      `}
            whileHover={hoverEffect ? { scale: 1.02, y: -5 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            <div className="relative z-10 w-full h-full">
                {children}
            </div>

            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-forest-300/20 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
    );
};

export default GlassCard;
