import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface WoodButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const WoodButton: React.FC<WoodButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const baseStyles = "relative font-bold text-wood-900 rounded-xl transition-all active:top-[4px] active:shadow-wood-btn-active";

    const variants = {
        primary: "bg-wood-500 text-wood-50 shadow-wood-btn border-b-4 border-wood-700",
        secondary: "bg-wood-100 text-wood-900 shadow-wood-btn border-b-4 border-wood-300",
        danger: "bg-red-500 text-white shadow-[0_4px_0_#991b1b,_0_5px_10px_rgba(0,0,0,0.3)] border-b-4 border-red-700",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {/* Wood texture overlay if needed, currently using CSS background color */}
            {children}
        </motion.button>
    );
};
