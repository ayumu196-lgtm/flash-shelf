import React from 'react';
import clsx from 'clsx';

interface WoodInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const WoodInput: React.FC<WoodInputProps> = ({ className, ...props }) => {
    return (
        <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gold-dark blur-sm translate-y-1" />
            <input
                className={clsx(
                    "relative w-full rounded-lg border-2 border-gold-dark bg-paper-dark px-4 py-3 text-wood-900 placeholder-wood-400 shadow-inner focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20",
                    className
                )}
                {...props}
            />
            {/* Screw heads for decoration */}
            <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gold-dark opacity-50">⊕</div>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gold-dark opacity-50">⊕</div>
        </div>
    );
};
