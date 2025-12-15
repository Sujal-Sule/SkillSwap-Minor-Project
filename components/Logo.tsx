import React from 'react';

// Using the project's primary theme color for brand consistency.
const BRAND_COLOR = "#0ea5e9"; // Corresponds to sky-500

interface LogoProps {
    size?: number;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="SkillSwap Logo"
        >
            {/* Background circle removed */}

            {/* Define paths for text to follow */}
            <defs>
                {/* Arc for "SKILLSWAP" */}
                <path
                    id="logo-top-arc"
                    d="M 42, 100 a 58,58 0 1,1 116,0"
                    fill="none"
                />
                {/* Arc for "Learn together, grow together" */}
                <path
                    id="logo-bottom-arc"
                    d="M 25, 108 a 75,75 0 1,0 150,0"
                    fill="none"
                />
            </defs>

            {/* Group for all visual elements */}
            <g transform="translate(0, -10)">
                {/* Text Elements */}
                <g fill={BRAND_COLOR}>
                    <text style={{ fontFamily: 'inherit', fontSize: '26px', fontWeight: 700, letterSpacing: '2px' }}>
                        <textPath href="#logo-top-arc" startOffset="50%" textAnchor="middle">
                            SKILLSWAP
                        </textPath>
                    </text>
                    <text style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px' }}>
                        <textPath href="#logo-bottom-arc" startOffset="50%" textAnchor="middle">
                            Learn together, grow together
                        </textPath>
                    </text>
                </g>

                {/* Central Icon: People and Arrows */}
                <g stroke={BRAND_COLOR} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 10)">
                    {/* Top-left person icon */}
                    <circle cx="75" cy="85" r="10" />
                    <path d="M 60,108 A 18,18 0 0 1 90,108" />

                    {/* Bottom-right person icon */}
                    <circle cx="125" cy="125" r="10" />
                    <path d="M 110,148 A 18,18 0 0 1 140,148" />

                    {/* Top-right arrow (clockwise) */}
                    <path d="M 92,80 A 40,40 0 0 1 125,105" />
                    <path d="M 116,112 L 125,105 L 134,112" />

                    {/* Bottom-left arrow (counter-clockwise) */}
                    <path d="M 108,130 A 40,40 0 0 1 75,105" />
                    <path d="M 84,98 L 75,105 L 66,98" />
                </g>

                {/* Sparkle elements */}
                <g fill={BRAND_COLOR} transform="translate(0, 10)">
                    <path d="M 35,105 l 5,-5 l 5,5 l -5,5 z" />
                    <path d="M 155,105 l 5,-5 l 5,5 l -5,5 z" />
                </g>
            </g>
        </svg>
    );
};

export default Logo;