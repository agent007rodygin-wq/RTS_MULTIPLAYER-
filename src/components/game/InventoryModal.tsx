import React, { memo } from 'react';
import { InventoryIcon } from '../../../components/IconComponents';
import type { Item } from '../../../types';

export interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Record<number, number>;
    itemData: Item[];
    playCloseSound?: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = memo(({
    isOpen,
    onClose,
    inventory,
    itemData,
    playCloseSound
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        if (playCloseSound) playCloseSound();
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div
                className="relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundImage: 'url(/Gui/build_menu_bg.webp)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    width: 'min(var(--ui-modal-width), calc(100vw - 32px))',
                    height: 'min(var(--ui-modal-height), calc(100vh - 32px))',
                    padding: 'var(--ui-modal-padding-top) var(--ui-modal-padding-right) var(--ui-modal-padding-bottom) var(--ui-modal-padding-left)',
                    overflow: 'hidden'
                }}
            >
                {/* Title centered + close button */}
                <div className="flex items-center justify-center relative" style={{ padding: '0 8px', marginTop: '10px', marginBottom: '4px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '7px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>Инвентарь</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute"
                        style={{
                            right: '-23px',
                            top: '3px',
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)',
                            boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)',
                            border: '1px solid rgba(96,165,250,0.4)',
                            color: 'rgba(200,225,255,0.9)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55), 0 0 36px 12px rgba(96,165,250,0.25), inset 0 0 12px rgba(150,200,255,0.35)';
                            e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.4) 0%, rgba(60,130,220,0.2) 60%, transparent 100%)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)';
                            e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)';
                            e.currentTarget.style.color = 'rgba(200,225,255,0.9)';
                        }}
                    >
                    </button>
                </div>
                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {Object.keys(inventory).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <InventoryIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p>Ваш инвентарь пуст.</p>
                            <p className="text-sm mt-2">Попробуйте собрать дерево!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                            {Object.entries(inventory).map(([idStr, val]) => {
                                const amount = val as number;
                                const id = parseInt(idStr);
                                if (amount <= 0) return null;
                                const item = itemData.find(i => i.id === id);
                                return (
                                    <div key={id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px', border: '2px solid rgba(255,255,255,0.07)', textAlign: 'center', position: 'relative' }}>
                                        <div style={{ width: '100%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                            {item ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center text-xs">?</div>
                                            )}
                                        </div>
                                        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 700, color: '#d0d8e0', marginBottom: '2px' }}>{item ? item.name : `Item #${id}`}</p>
                                        <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fbbf24', fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 800, padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {amount}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

InventoryModal.displayName = 'InventoryModal';
