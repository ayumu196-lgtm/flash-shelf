import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, children, title }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-theme-text/20 backdrop-blur-sm"
                    />

                    {/* Sheet - Heavy Rounded Top */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-2xl overflow-hidden rounded-t-[32px] bg-white px-6 pb-10 pt-6 shadow-modal"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-[#FFF0F3]" />

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#4A4A4A]">{title}</h2>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-[#FFF0F3] p-2 text-[#FF7C90] hover:bg-[#FF7C90] hover:text-white transition-colors"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 120px)' }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
