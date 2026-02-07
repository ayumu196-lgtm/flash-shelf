import React, { useState } from 'react';
import { Search, ScanLine, Upload } from 'lucide-react';
import Quagga from 'quagga'; // @ts-ignore
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';
import type { NewBook } from '../types';
import { supabase } from '../lib/supabase';

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
    const [uploadingImage, setUploadingImage] = useState(false);

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
                setLoading(false);
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
                // 見つからなかった場合のみアラート表示
                alert('この本は見つかりませんでした。\n手動で入力してください。');
            }
        } catch (e) {
            console.error(e);
            // ネットワークエラーのみアラート
            alert('ネットワークエラーが発生しました');
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

                    // ISBN-13のみ受け入れ (978 or 979で始まる13桁)
                    if (code.length === 13 && (code.startsWith('978') || code.startsWith('979'))) {
                        setIsbnInput(code);
                        Quagga.stop();
                        setScannerActive(false);
                        setMode('manual');
                        fetchBookInfo(code);
                    }
                    // 無効なバーコード（価格コードなど）は静かに無視してスキャン継続
                }
            });
        }, 100);
    };

    const stopScanner = () => {
        Quagga.stop();
        setScannerActive(false);
    };

    const uploadCoverImage = async (file: File) => {
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('book-covers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('book-covers')
                .getPublicUrl(filePath);

            setCoverUrl(data.publicUrl);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('画像のアップロードに失敗しました');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadCoverImage(file);
        }
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

                    {/* Cover Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#4A4A4A] ml-2">表紙画像</label>
                        <div className="flex gap-2">
                            <label className="flex-shrink-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF7C90] text-white cursor-pointer hover:bg-[#FF6B80] transition-colors font-bold">
                                    <Upload size={20} />
                                    {uploadingImage ? 'アップロード中...' : '画像を選択'}
                                </div>
                            </label>
                            <input
                                type="url"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="または画像URL"
                                className="flex-1 rounded-full bg-[#FFFCF9] border-2 border-[#FFD1D9] px-6 py-3 outline-none focus:border-[#FF7C90] text-[#4A4A4A] placeholder-[#FFD1D9]"
                            />
                        </div>
                        {coverUrl && (
                            <div className="flex items-center gap-2 p-2 bg-[#FFF0F3] rounded-xl">
                                <img src={coverUrl} alt="プレビュー" className="w-12 h-16 object-cover rounded" />
                                <span className="text-xs text-[#4A4A4A] truncate flex-1">{coverUrl}</span>
                            </div>
                        )}
                    </div>

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
