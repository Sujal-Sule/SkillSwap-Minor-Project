import React from 'react';
import { motion } from 'framer-motion';

interface GlowBorderCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const GlowBorderCard: React.FC<GlowBorderCardProps> = ({ children, className = '', onClick }) => {
    return (
        <div className={`relative group isolate p-[2px] rounded-xl overflow-hidden ${className}`} onClick={onClick}>
            {/* Animated Gradient Background Border */}
            <motion.div
                className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Infinity,
                }}
            />
            <motion.div
                className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#0ea5e9_360deg)] mix-blend-color-dodge opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Infinity,
                }}
            />

            {/* Content Container */}
            <div className="relative h-full bg-slate-800 rounded-[10px] z-10 w-full">
                {children}
            </div>

            {/* Glow Overlay */}
            <div className="absolute inset-0 z-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
        </div>
    );
};

export default GlowBorderCard;
