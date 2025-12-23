import { type ButtonHTMLAttributes } from 'react'
import { RotateCw } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    fullWidth?: boolean
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    loading,
    fullWidth,
    children,
    className = '',
    ...props
}: ButtonProps) => {
    const baseClass = "font-bold rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

    // Updated 'Frescura Caribeña' gradients
    const variants = {
        primary: "bg-gradient-to-r from-secondary to-primary text-white shadow-lg hover:shadow-xl hover:scale-105",
        secondary: "bg-white text-secondary border border-secondary hover:bg-secondary/5 shadow-sm",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
    }

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    }

    return (
        <button
            className={`${baseClass} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <RotateCw className="animate-spin" size={16} />}
            {children}
        </button>
    )
};
