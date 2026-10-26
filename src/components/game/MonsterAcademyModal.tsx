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
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[60] backdrop-blur-md" onClick={onClose}>
            <div className="relative w-full h-full md:w-auto md:h-auto flex flex-col items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                {/* Academy Menu Image Container */}
                <div className="relative">
                    <img 
                        src="/academymonsters/seEsr.webp" 
                        alt="Академия монстров" 
                        className="w-full h-auto md:max-h-[85vh] md:w-auto object-contain rounded-lg"
                    />
                    
                    {/* Create Buttons Overlay - positioned under each capsule */}
                    <div className="absolute bottom-[8%] left-0 right-0 flex justify-center gap-[8%] px-[10%]">
                        <button 
                            disabled
                            className="bg-purple-700/80 hover:bg-purple-600/80 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg text-xs md:text-sm border-2 border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                        
                        <button 
                            disabled
                            className="bg-purple-700/80 hover:bg-purple-600/80 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg text-xs md:text-sm border-2 border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                        
                        <button 
                            disabled
                            className="bg-purple-700/80 hover:bg-purple-600/80 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg text-xs md:text-sm border-2 border-purple-400/50 backdrop-blur-sm transition-all"
                        >
                            Создать
                        </button>
                    </div>
                </div>
                
                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all"
                >
                    <CloseIcon className="w-8 h-8" />
                </button>
                
                {/* Hint text */}
                <p className="text-gray-400 text-xs md:text-sm mt-4 text-center">
                    Выберите монстра для создания
                </p>
            </div>
        </div>
    );
};

export const MonsterAcademyModal = memo(MonsterAcademyModalComponent, (prev, next) => {
    return !prev.isOpen && !next.isOpen;
});
