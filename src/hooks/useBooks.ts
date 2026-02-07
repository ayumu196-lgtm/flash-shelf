import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Book, NewBook } from '../types';

export function useBooks() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBooks();

        const subscription = supabase
            .channel('books_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'books' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBooks((prev) => [payload.new as Book, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setBooks((prev) => prev.filter((book) => book.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setBooks((prev) =>
                            prev.map((book) =>
                                book.id === payload.new.id ? (payload.new as Book) : book
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function fetchBooks() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBooks(data || []);
        } catch (err) {
            console.error('Error fetching books:', err);
            setError(err instanceof Error ? err.message : '書籍の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }

    async function addBook(newBook: NewBook) {
        try {
            const { error } = await supabase.from('books').insert([newBook]);
            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error adding book:', err);
            throw err;
        }
    }

    async function deleteBook(id: string) {
        try {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting book:', err);
            throw err;
        }
    }

    async function updateBook(id: string, updates: Partial<Book>) {
        try {
            const { error } = await supabase.from('books').update(updates).eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error('Error updating book:', err);
            throw err;
        }
    }

    return { books, loading, error, addBook, deleteBook, updateBook };
}
