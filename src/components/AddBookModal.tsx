import React, { useState } from 'react';
import { Search, ScanLine } from 'lucide-react';
import Quagga from 'quagga'; // @ts-ignore
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import type { NewBook } from '../types';

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (book: NewBook) => Promise<boolean>;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [mode, setMode] = useState<'manual' | 'scan'>('manual');
    const [isbnInput, setIsbnInput] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [coverUrl, setCoverUrl] = useState('');
    const [tags, setTags] = useState('');

    const fetchBookInfo = async (isbn: string) => {
        setLoading(true);
        try {
            // 1. Try OpenBD first (Best for Japanese books)
            const openBdResponse = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            const openBdData = await openBdResponse.json();

            if (openBdData && openBdData[0]) {
                const bookData = openBdData[0].summary;
                setTitle(bookData.title);
                setCoverUrl(bookData.cover || '');
                // OpenBD doesn't provide tags/categories in a simple way, but that's fine
                setTags('');
                return;
            }

            // 2. Fallback to Google Books API
            const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const googleData = await googleResponse.json();

            if (googleData.items && googleData.items.length > 0) {
                const info = googleData.items[0].volumeInfo;
                setTitle(info.title);
                setCoverUrl(info.imageLinks?.thumbnail || '');
                if (info.categories) {
                    setTags(info.categories.join(', '));
                }
            } else {
                alert('本が見つかりませんでした');
            }
        } catch (e) {
            console.error(e);
            alert('検索に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const startScanner = () => {
        setScannerActive(true);
        setTimeout(() => {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#scanner-container') as HTMLElement,
                    constraints: {
                        facingMode: "environment"
                    },
                },
                decoder: {
                    readers: ["ean_reader"]
                }
            }, (err: any) => {
                if (err) {
                    console.error(err);
                    setScannerActive(false);
                    return;
                }
                Quagga.start();
            });

            Quagga.onDetected((data: any) => {
                if (data.codeResult.code) {
                    const code = data.codeResult.code;
                    setIsbnInput(code);
                    Quagga.stop();
                    setScannerActive(false);
                    setMode('manual');
                    fetchBookInfo(code);
                }
            });
        }, 100);
    };

    const stopScanner = () => {
        Quagga.stop();
        setScannerActive(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        try {
            await onAdd({
                title,
                isbn: isbnInput,
                cover_url: coverUrl,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            setTitle('');
            setIsbnInput('');
            setCoverUrl('');
            setTags('');
            setMode('manual');
            onClose();
        } catch (e) {
            alert('保存に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose} title="新しい本を追加">
            {/* Mode Switcher */}
            <div className="flex gap-2 mb-6 p-1 bg-[#FFF0F3] rounded-full">
                <button
                    onClick={() => { setMode('manual'); stopScanner(); }}
                    className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${mode === 'manual' ? 'bg-white text-[#FF7C90] shadow-sm' : 'text-[#A0A0A0]'
                        }`}
                >
                    手入力 / 検索
                </button>
                <button
                    onClick={() => setMode('scan')}
                    className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${mode === 'scan' ? 'bg-white text-[#FF7C90] shadow-sm' : 'text-[#A0A0A0]'
                        }`}
                >
                    バーコード
                </button>
            </div>

            {mode === 'scan' ? (
                <div className="flex flex-col items-center pb-4">
                    {!scannerActive ? (
                        <button
                            onClick={startScanner}
                            className="flex h-48 w-full flex-col items-center justify-center rounded-2xl bg-[#FFFCF9] border-2 border-dashed border-[#FF7C90] text-[#FF7C90] transition-colors hover:bg-[#FFF0F3]"
                        >
                            <ScanLine size={48} className="mb-2 opacity-50" />
                            <span className="font-bold">カメラを起動する</span>
                        </button>
                    ) : (
                        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                            <div id="scanner-container" className="absolute inset-0 h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="h-40 w-64 rounded border-2 border-[#FF7C90] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                            </div>
                            <Button
                                variant='secondary'
                                onClick={stopScanner}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                            >
                                停止
                            </Button>
                        </div>
                    )}
                    <p className="mt-4 text-xs text-[#A0A0A0] text-center">
                        本の裏表紙にあるISBNバーコードを<br />枠内に写してください
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pb-8">
                    <div className="flex gap-2">
                        <input
                            value={isbnInput}
                            onChange={(e) => setIsbnInput(e.target.value)}
                            placeholder="ISBN (例: 9784...)"
                            className="flex-1 rounded-full bg-[#FFFCF9] border-2 border-[#FFD1D9] px-6 py-3 outline-none focus:border-[#FF7C90] text-[#4A4A4A] placeholder-[#FFD1D9]"
                        />
                        <Button type='button' onClick={() => fetchBookInfo(isbnInput)} variant="secondary" className="px-4">
                            <Search size={24} />
                        </Button>
                    </div>

                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="タイトル"
                        className="w-full rounded-full bg-[#FFFCF9] border-2 border-[#FFD1D9] px-6 py-3 outline-none focus:border-[#FF7C90] text-[#4A4A4A] placeholder-[#FFD1D9]"
                    />

                    <input
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="表紙画像URL"
                        className="w-full rounded-full bg-[#FFFCF9] border-2 border-[#FFD1D9] px-6 py-3 outline-none focus:border-[#FF7C90] text-[#4A4A4A] placeholder-[#FFD1D9]"
                    />

                    <input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="タグ (カンマ区切り)"
                        className="w-full rounded-full bg-[#FFFCF9] border-2 border-[#FFD1D9] px-6 py-3 outline-none focus:border-[#FF7C90] text-[#4A4A4A] placeholder-[#FFD1D9]"
                    />

                    <Button type="submit" size="lg" className="w-full mt-4 shadow-cute" disabled={loading}>
                        {loading ? '処理中...' : 'ライブラリに追加'}
                    </Button>
                </form>
            )}
        </Sheet>
    );
};
