import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps {
    children: ReactNode
    className?: string
    onClick?: () => void
    luxury?: boolean // New prop for Gold Border
}

export const Card = ({ children, className = '', onClick, luxury }: CardProps) => {
    return (
        <div
            className={twMerge(`
                bg-white/80 backdrop-blur-md 
                rounded-xl shadow-md border 
                ${luxury ? 'border-accent-gold border-2' : 'border-white/50'}
                transition-all duration-300
                ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-[#4B3179]' : ''} 
            `, className)}
            onClick={onClick}
        >
            {children}
        </div>
    )
};
