import React, { memo } from 'react';
import { CloseIcon } from '../../../components/IconComponents';

export interface MonsterAcademyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MonsterAcademyModalComponent: React.FC<MonsterAcademyModalProps> = ({
    isOpen,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-[60] backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full md:w-auto md:h-auto flex flex-col items-center justify-center p-2 animate-scale-up" onClick={e => e.stopPropagation()}>
                {/* Academy Menu Image Container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                    <img 
                        src="/academymonsters/seEsr.webp" 
                        alt="Академия монстров" 
                        className="w-full h-auto md:max-h-[82vh] md:w-auto object-contain rounded-2xl"
                    />
                    
                    {/* Create Buttons Overlay - positioned under each capsule */}
                    <div className="absolute bottom-[8%] left-0 right-0 flex justify-center gap-[8%] px-[10%]">
                        <button 
                            disabled
                            className="bg-purple-950/80 hover:bg-purple-900/80 disabled:bg-gray-800/80 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl text-xs md:text-sm border border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                        
                        <button 
                            disabled
                            className="bg-purple-950/80 hover:bg-purple-900/80 disabled:bg-gray-800/80 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl text-xs md:text-sm border border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                        
                        <button 
                            disabled
                            className="bg-purple-950/80 hover:bg-purple-900/80 disabled:bg-gray-800/80 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl text-xs md:text-sm border border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                    </div>

                    {/* Close button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/80 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 z-10"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Hint text */}
                <p className="text-purple-300/80 text-xs md:text-sm mt-3 text-center font-medium">
                    Выберите монстра для создания
                </p>
            </div>
        </div>
    );
};

export const MonsterAcademyModal = memo(MonsterAcademyModalComponent, (prev, next) => {
    return !prev.isOpen && !next.isOpen;
});
