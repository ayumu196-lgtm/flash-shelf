import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCard } from './BookCard';
import type { Book } from '../types';

interface BookListProps {
    books: Book[];
    filterTag: string | null;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Book>) => void;
}

export const BookList: React.FC<BookListProps> = ({ books, filterTag, onDelete, onUpdate }) => {
    const filteredBooks = useMemo(() => {
        if (!filterTag) return books;
        return books.filter((book) => book.tags?.includes(filterTag));
    }, [books, filterTag]);

    // Empty State
    if (books.length === 0) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
                <div className="mb-6 h-40 w-40 rounded-full bg-[#FFF0F3] flex items-center justify-center animate-bounce-slow">
                    <span className="text-6xl">🐣</span>
                </div>
                <h2 className="text-xl font-bold text-[#FF7C90] mb-2">まだ本がありません</h2>
                <p className="text-[#4A4A4A] text-sm">真ん中の追加ボタンから<br />お気に入りの本を登録してね！</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full px-5 pb-32 pt-14 bg-[#FFFCF9]">

            {/* Header - Cute Pill Title */}
            <div className="flex justify-center mb-8">
                <div className="bg-white px-8 py-2 rounded-full shadow-sm border border-[#FFF0F3]">
                    <h1 className="text-lg font-extrabold text-[#FF7C90] tracking-widest">
                        わたしの本棚
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
                <AnimatePresence mode='popLayout'>
                    {filteredBooks.map((book) => (
                        <motion.div
                            layout
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', bounce: 0.4 }}
                        >
                            <BookCard book={book} onDelete={onDelete} onUpdate={onUpdate} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
