import React, { useRef } from 'react';
import type { User } from '../types';

interface GlowingUserCardProps {
    children: React.ReactNode;
    user: User;
}

const GlowingUserCard: React.FC<GlowingUserCardProps> = ({ children, user }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="glowing-card rounded-xl"
            key={user.id}
        >
            {children}
        </div>
    );
};

export default GlowingUserCard;
