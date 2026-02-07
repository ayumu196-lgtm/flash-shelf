import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 tracking-wider";

    const variants = {
        primary: "bg-[#FF7C90] text-white shadow-[0_4px_14px_rgba(255,124,144,0.4)] hover:bg-[#FF6B82]",
        secondary: "bg-white text-[#FF7C90] border-2 border-[#FF7C90] hover:bg-[#FFF0F3]",
        ghost: "bg-transparent text-[#FF7C90] hover:bg-[#FFF0F3]/50",
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-10 py-4 text-base",
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};
