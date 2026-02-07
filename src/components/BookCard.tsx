import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import type { Book } from '../types';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';

interface BookCardProps {
    book: Book;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Book>) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onUpdate }) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    return (
        <>
            <div
                onClick={() => setIsDetailOpen(true)}
                className="group relative cursor-pointer bg-white p-3 rounded-2xl shadow-card border border-transparent hover:border-piyo-pinkLight transition-all"
            >
                {/* Cover Image */}
                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-piyo-pinkLight mb-3 relative">
                    {book.cover_url ? (
                        <img
                            src={book.cover_url}
                            alt={book.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-piyo-gray font-bold opacity-50">
                            No Cover
                        </div>
                    )}

                    {/* Favorite Indicator (Heart) */}
                    {(book.rating || 0) >= 4 && (
                        <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm text-piyo-pink">
                            <Heart size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <h3 className="line-clamp-2 text-sm font-bold text-piyo-text leading-snug mb-1">
                    {book.title}
                </h3>

                {/* Mini Stars */}
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={10}
                            className={i < (book.rating || 0) ? "fill-piyo-pink text-piyo-pink" : "text-piyo-pinkLight"}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sheet */}
            <Sheet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="本の詳細">
                <div className="flex flex-col gap-6 pb-6">
                    <div className="flex gap-4 bg-piyo-pinkLight/30 p-4 rounded-3xl">
                        <div className="w-24 shrink-0 rounded-xl overflow-hidden shadow-sm bg-white">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="h-auto w-full" />
                            ) : (
                                <div className="aspect-[2/3] w-full bg-piyo-pinkLight" />
                            )}
                        </div>
                        <div className="flex-1 py-1">
                            <h2 className="text-lg font-bold text-piyo-text leading-tight mb-3">{book.title}</h2>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <button key={i} onClick={() => onUpdate(book.id, { rating: i + 1 })}>
                                        <Star
                                            key={i}
                                            size={24}
                                            className={i < (book.rating || 0) ? "fill-piyo-pink text-piyo-pink" : "text-piyo-pinkLight"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-piyo-text ml-1">ひとことメモ</label>
                        <textarea
                            className="w-full bg-white border-2 border-piyo-pinkLight rounded-2xl p-4 text-sm focus:outline-none focus:border-piyo-pink transition-colors min-h-[100px]"
                            placeholder="感想を入力してね"
                            defaultValue={book.comment || ''}
                            onBlur={(e) => onUpdate(book.id, { comment: e.target.value })}
                        />
                    </div>

                    <Button
                        variant="ghost"
                        className="text-piyo-gray hover:text-white hover:bg-red-400 mt-4 border border-transparent hover:border-red-400 transition-all font-bold"
                        onClick={() => {
                            if (window.confirm('本当に削除してもいいですか？\n（この操作は取り消せません）')) {
                                onDelete(book.id);
                                setIsDetailOpen(false);
                            }
                        }}
                    >
                        🗑️ この本を削除する
                    </Button>
                </div>
            </Sheet>
        </>
    );
};
