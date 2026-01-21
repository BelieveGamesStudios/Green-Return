import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { haptics } from '../../lib/haptics';

/**
 * GlassButton Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.variant='primary'] - primary, secondary, danger, ghost
 * @param {string} [props.size='md'] - sm, md, lg
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 */
const GlassButton = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon,
    className = '',
    ...props
}) => {
    const baseStyles = "relative overflow-hidden rounded-xl bg-opacity-80 backdrop-blur-md shadow-glass transition-all duration-300 flex items-center justify-center gap-2 font-medium bg-gradient-to-br";

    const variants = {
        primary: "bg-forest-600 text-white hover:bg-forest-700 border-2 border-forest-700 shadow-lg",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 border-2 border-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 border-2 border-red-700",
        ghost: "bg-transparent shadow-none hover:bg-gray-200 border-2 border-gray-300 text-gray-900",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed grayscale pointer-events-none";

    const handleClick = (e) => {
        if (!disabled && !isLoading) {
            haptics.light();
            if (props.onClick) props.onClick(e);
        }
    };

    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.02, brightness: 1.1 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled || isLoading ? disabledStyles : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            onClick={handleClick}
            {...props}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />

            {isLoading && <LoadingSpinner size="sm" className="text-current" />}

            {!isLoading && icon && <span className="flex items-center">{icon}</span>}

            <span className={isLoading ? "invisible" : ""}>{children}</span>
        </motion.button>
    );
};

export default GlassButton;
