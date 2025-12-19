import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'gold' | 'orange' | 'purple' | 'green' | 'gray';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
    const variants = {
        gold: "bg-yellow-50 text-accent-gold border-accent-gold/20",
        orange: "bg-orange-50 text-accent-orange border-accent-orange/20",
        purple: "bg-purple-50 text-primary border-primary/20",
        green: "bg-teal-50 text-secondary border-secondary/20",
        gray: "bg-gray-100 text-text-secondary border-gray-200"
    };

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
