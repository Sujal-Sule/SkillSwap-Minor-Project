import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface PressureTextProps {
    text: string;
}

const PressureText: React.FC<PressureTextProps> = ({ text }) => {
    // FIX: Explicitly typed `Char` component props to include `children`.
    // In modern React with TypeScript, `React.FC` no longer includes `children` by default.
    const Char: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const ref = useRef<HTMLSpanElement>(null);
        const mouseX = useMotionValue(Infinity);
        
        const distance = useTransform(mouseX, (val) => {
            const bounds = ref.current?.getBoundingClientRect();
            return val - (bounds?.x ?? 0) - (bounds?.width ?? 0) / 2;
        });
        
        const widthSync = useTransform(distance, [-200, 0, 200], [75, 125, 75]);
        const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

        return (
            <motion.span
                ref={ref}
                style={{ fontVariationSettings: `"wdth" ${width}` }}
                onMouseMove={(e) => mouseX.set(e.clientX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="transition-colors duration-500 hover:text-sky-700"
            >
                {children}
            </motion.span>
        );
    };

    return (
        <span className="inline-block">
            {text.split("").map((char, i) => (
                <Char key={i}>{char === " " ? "\u00A0" : char}</Char>
            ))}
        </span>
    );
};

export default PressureText;