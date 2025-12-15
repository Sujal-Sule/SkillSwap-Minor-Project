import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface GlassyButtonProps extends MotionProps {
    onClick: () => void;
    text: string;
    className?: string;
}

const GlassyButton: React.FC<GlassyButtonProps> = ({ onClick, text, className = '', ...rest }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`
                relative px-8 py-3 text-lg font-bold text-white
                bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg
                overflow-hidden transition-all duration-300
                hover:shadow-sky-500/20 hover:bg-white/10 hover:border-white/20
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500
                ${className}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...rest}
        >
            <span className="relative z-10">{text}</span>
        </motion.button>
    );
};

export default GlassyButton;