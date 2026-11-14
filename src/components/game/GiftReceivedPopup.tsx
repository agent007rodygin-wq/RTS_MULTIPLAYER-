import React, { memo } from 'react';

export interface GiftReceivedPopupData {
    fromId: string;
    fromName: string;
    buildingId: number;
    buildingName: string;
    buildingImageUrl?: string;
    at: number;
}

export interface GiftReceivedPopupProps {
    gift: GiftReceivedPopupData | null;
    onClose: () => void;
    playOpenSound?: () => void;
}

/**
 * Juice-style "you received a gift" popup. Fired in real time when the
 * recipient's users snapshot delivers a fresh data.lastGiftNotification
 * written by the gift-send server hook.
 */
export const GiftReceivedPopup: React.FC<GiftReceivedPopupProps> = memo(({
    gift,
    onClose,
    playOpenSound
}) => {
    if (!gift) return null;

    const handleOpen = () => {
        if (playOpenSound) playOpenSound();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[10050] flex items-center justify-center pointer-events-none"
            onClick={handleOpen}
        >
            <style>{`
                @keyframes gift-popup-pop-in {
                    0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
                    55% { transform: scale(1.12) rotate(2deg); opacity: 1; }
                    75% { transform: scale(0.95) rotate(-1deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes gift-popup-glow {
                    0%, 100% { box-shadow: 0 0 24px 6px rgba(244, 114, 182, 0.45), 0 0 60px 18px rgba(236, 72, 153, 0.18); }
                    50% { box-shadow: 0 0 40px 12px rgba(244, 114, 182, 0.65), 0 0 90px 30px rgba(236, 72, 153, 0.3); }
                }
            `}</style>
            <div
                className="pointer-events-auto flex flex-col items-center text-center"
                style={{
                    background: 'linear-gradient(165deg, rgba(30, 20, 45, 0.97) 0%, rgba(60, 25, 55, 0.97) 100%)',
                    border: '2px solid rgba(249, 168, 212, 0.6)',
                    borderRadius: '22px',
                    padding: '22px 28px',
                    maxWidth: '340px',
                    width: 'calc(100vw - 48px)',
                    animation: 'gift-popup-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both, gift-popup-glow 1.8s ease-in-out infinite'
                }}
            >
                <p
                    className="font-black text-lg"
                    style={{
                        fontFamily: 'Nunito, sans-serif',
                        color: '#f9a8d4',
                        textShadow: '0 0 14px rgba(244, 114, 182, 0.55)'
                    }}
                >
                    🎁 Вам подарили подарок!
                </p>

                <div
                    className="my-3 flex items-center justify-center"
                    style={{
                        width: '104px',
                        height: '104px',
                        background: 'rgba(244, 114, 182, 0.12)',
                        border: '1.5px solid rgba(249, 168, 212, 0.4)',
                        borderRadius: '18px',
                        overflow: 'hidden'
                    }}
                >
                    {gift.buildingImageUrl ? (
                        <img
                            src={gift.buildingImageUrl}
                            alt={gift.buildingName}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <span style={{ fontSize: '56px' }}>🎁</span>
                    )}
                </div>

                <p
                    className="font-extrabold text-white text-base leading-tight"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    «{gift.buildingName}»
                </p>
                <p
                    className="text-sm mt-0.5"
                    style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(233, 213, 255, 0.85)' }}
                >
                    От игрока: <span className="font-bold text-pink-300">{gift.fromName || '…'}</span>
                </p>

                <p
                    className="text-xs mt-2"
                    style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(200, 210, 220, 0.7)' }}
                >
                    Он уже в вашем инвентаре 🎒 — откройте инвентарь и нажмите «Поставить».
                </p>

                <button
                    onClick={handleOpen}
                    className="mt-4 w-full py-2.5 rounded-xl font-extrabold text-white text-sm transition-all active:scale-95 cursor-pointer"
                    style={{
                        fontFamily: 'Nunito, sans-serif',
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        border: '1px solid rgba(249, 168, 212, 0.6)',
                        boxShadow: '0 4px 18px rgba(236, 72, 153, 0.4)'
                    }}
                >
                    Ура! 🎉
                </button>
            </div>
        </div>
    );
});

GiftReceivedPopup.displayName = 'GiftReceivedPopup';
