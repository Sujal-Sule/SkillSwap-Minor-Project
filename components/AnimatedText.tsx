import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface AnimatedTextProps {
    text: string;
    className?: string;
    delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', delay = 0 }) => {
    const words = text.split(" ");

    // FIX: Added 'Variants' type to fix 'transition' property type error.
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: (0.04 * i) + delay },
        }),
    };

    // FIX: Added 'Variants' type to fix 'transition.type' property type error.
    const childVariants: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    variants={childVariants}
                    style={{ marginRight: '0.35em' }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default AnimatedText;