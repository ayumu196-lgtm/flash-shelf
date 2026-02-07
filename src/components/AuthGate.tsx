import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Heart } from 'lucide-react';
import { Button } from './ui/Button';

interface AuthGateProps {
    children: React.ReactNode;
}

const PASSWORD = 'mokumoku';
const STORAGE_KEY = 'flash_shelf_auth';

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input === PASSWORD) {
            localStorage.setItem(STORAGE_KEY, 'true');
            setIsAuthenticated(true);
        } else {
            setError(true);
            setTimeout(() => setError(false), 800);
            setInput('');
        }
    };

    return (
        <>
            <AnimatePresence>
                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFCF9] px-6"
                    >
                        {/* Title / Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-10 text-center"
                        >
                            <h1 className="text-2xl font-bold text-[#FF7C90] mb-6">Flash Shelf へようこそ！</h1>
                            {/* Visual Graphic */}
                            <div className="relative mx-auto flex justify-center items-center">
                                <div className="h-28 w-28 rounded-full bg-white border-4 border-[#FFF0F3] flex items-center justify-center shadow-lg relative z-10">
                                    <Bot size={56} className="text-[#FF7C90]" />
                                </div>
                                <div className="absolute top-0 right-10 animate-bounce">
                                    <Heart size={24} className="fill-[#FF7C90] text-[#FF7C90]" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Action Area */}
                        <div className="w-full max-w-xs space-y-4">
                            {showInput ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <p className="text-[#4A4A4A] font-bold text-sm">パスコード</p>
                                        <input
                                            type="password"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            autoFocus
                                            className={`w-full rounded-full border-2 bg-white px-6 py-3 text-center text-xl font-bold tracking-widest outline-none transition-colors text-[#4A4A4A] placeholder-[#FFF0F3] ${error
                                                    ? 'border-red-400 text-red-500'
                                                    : 'border-[#FF7C90] focus:ring-4 focus:ring-[#FFF0F3]'
                                                }`}
                                            placeholder="●●●●"
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full" variant="primary">
                                        ロック解除
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowInput(false)} className="w-full text-xs">
                                        もどる
                                    </Button>
                                </form>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => setShowInput(true)}
                                        size="lg"
                                        className="w-full"
                                        variant="primary"
                                    >
                                        はじめる
                                    </Button>
                                    <p className="text-center text-xs text-[#A0A0A0]">まずはロックを解除してください</p>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {isAuthenticated && children}
        </>
    );
};
