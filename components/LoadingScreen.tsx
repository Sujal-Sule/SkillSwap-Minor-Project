import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const BRAND_COLOR = "#0ea5e9"; // sky-500, to match the new logo color

const LoadingScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress to reach 100% in roughly 1.5 seconds
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 15);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900">
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    filter: [
                        `drop-shadow(0 0 0px ${BRAND_COLOR})`,
                        `drop-shadow(0 0 20px ${BRAND_COLOR})`,
                        `drop-shadow(0 0 0px ${BRAND_COLOR})`
                    ]
                }}
                transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            >
                <Logo size={160} />
            </motion.div>
            
            <div className="w-64 bg-slate-800 rounded-full h-2 mt-12 overflow-hidden border border-slate-700">
                <motion.div
                    className="bg-sky-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                />
            </div>
            
            <p className="mt-4 text-slate-400 tracking-widest text-sm font-mono">
                LOADING... {progress}%
            </p>
        </div>
    );
};

export default LoadingScreen;