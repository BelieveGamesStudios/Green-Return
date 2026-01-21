import { motion } from 'framer-motion';

/**
 * GlassInput Component
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 */
const GlassInput = ({ label, error, icon, className = '', id, ...props }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-forest-400 transition-colors">
                        {icon}
                    </div>
                )}

                <input
                    id={id}
                    className={`
            peer w-full bg-white/5 backdrop-blur-md
            border border-white/10
            rounded-xl py-3 px-4
            text-forest-950 dark:text-white 
            placeholder-transparent
            outline-none
            transition-all duration-300
            focus:border-forest-400/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)]
            hover:border-white/20
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500/50' : ''}
          `}
                    {...props}
                />

                <label
                    htmlFor={id}
                    className={`
            absolute left-4 top-3 
            text-white/50 text-base
            pointer-events-none
            transition-all duration-300
            peer-focus:-top-6 peer-focus:text-xs peer-focus:text-forest-400
            ${props.value && props.value.length > 0 ? '-top-6 text-xs text-forest-400' : ''}
            ${icon ? 'left-12' : ''}
          `}
                >
                    {label}
                </label>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs mt-1 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default GlassInput;
