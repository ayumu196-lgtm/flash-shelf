import React from 'react';
import { Library, ScanLine, Settings } from 'lucide-react';
import clsx from 'clsx';

interface TabBarProps {
    activeTab: 'library' | 'scan' | 'settings';
    onTabChange: (tab: any) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 pb-6 pt-3 backdrop-blur-md border-t border-[#FFD1D9] shadow-lg">
            <div className="mx-auto flex max-w-md justify-around px-6">
                <TabButton
                    icon={Library}
                    label="本棚"
                    isActive={activeTab === 'library'}
                    onClick={() => onTabChange('library')}
                />
                {/* Center Scan Button */}
                <div className="relative -top-6">
                    <button
                        onClick={() => onTabChange('scan')}
                        className={clsx(
                            "flex h-16 w-16 items-center justify-center rounded-full shadow-[0_4px_14px_rgba(255,124,144,0.4)] transition-transform active:scale-95",
                            activeTab === 'scan'
                                ? "bg-[#FF7C90] text-white ring-4 ring-[#FFF0F3]"
                                : "bg-white text-[#FF7C90] ring-4 ring-[#FFF0F3]"
                        )}
                    >
                        <ScanLine size={32} strokeWidth={2.5} />
                    </button>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#4A4A4A] whitespace-nowrap">スキャン</span>
                </div>

                <TabButton
                    icon={Settings}
                    label="設定"
                    isActive={activeTab === 'settings'}
                    onClick={() => onTabChange('settings')}
                />
            </div>
        </div>
    );
};

// Changed icon prop to accept the component type directly instead of ReactNode to make props easier to type
const TabButton = ({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex flex-col items-center gap-1 min-w-[60px] p-2 transition-colors",
            isActive ? "text-[#FF7C90]" : "text-[#A0A0A0]"
        )}
    >
        <div className={clsx("transition-transform", isActive && "scale-110")}>
            <Icon size={28} strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </button>
);
