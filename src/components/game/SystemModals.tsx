import React from 'react';
import { ENERGY_PURCHASE_OPTIONS } from '../../game/economy/energyPurchaseOptions';

const rubyImageUrl = '/Gui/Front/значек рубинов/Nj7hb.webp';
const permitGuideImageUrl = '/Gui/Back/permit-guide.webp';
const energyBatteryImageUrl = '/Gui/Back/energy-battery.webp';

export interface EnergyModalProps {
    state: { mode: 'warning' | 'shop'; requiredEnergy?: number } | null;
    onClose: () => void;
    onOpenShop: () => void;
    playerRubies: number;
    onBuyEnergyPack: (amount: number, rubies: number) => void;
}

const EnergyModalComponent: React.FC<EnergyModalProps> = ({
    state,
    onClose,
    onOpenShop,
    playerRubies,
    onBuyEnergyPack
}) => {
    if (!state) return null;

    const isShop = state.mode === 'shop';

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', aspectRatio: '1256 / 897', maxHeight: 'calc(100vh - 32px)' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно энергии"
                    style={{ right: '7.06%', top: '8.91%', transform: 'translate(50%, -50%)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center justify-center text-center" style={{ width: '88%', height: '84%', padding: '8px 24px', boxSizing: 'border-box' }}>
                    <div style={{ border: '2.5px solid #d2b168', borderRadius: '10px', boxShadow: '0 0 0 2px rgba(255,215,0,0.16), 0 4px 14px rgba(0,0,0,0.30)', overflow: 'hidden', width: isShop ? '68px' : '88px', minWidth: isShop ? '68px' : '88px', height: isShop ? '68px' : '88px', background: 'linear-gradient(180deg, #f8f1df 0%, #eadbbd 100%)', padding: '4px', marginBottom: isShop ? '6px' : '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={energyBatteryImageUrl} alt="Энергия" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    {!isShop ? (
                        <>
                            <h3 style={{ margin: 0, color: '#c95d2d', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '24px', lineHeight: 1.1 }}>
                                У вас недостаточно энергии!
                            </h3>
                            <p style={{ margin: '8px 0 14px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: 1.35, whiteSpace: 'pre-line' }}>
                                {`Вы можете немного подождать.\nЭнергия пополняется по 10 в минуту\nили купить ее за рубины${state.requiredEnergy ? `\n\nТребуется: ${state.requiredEnergy} энергии` : ''}`}
                            </p>
                            <button
                                onClick={onOpenShop}
                                style={{ minWidth: '240px', borderRadius: '16px', border: '1px solid #2d6811', background: 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1, padding: '12px 24px', boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)' }}
                            >
                                Купить энергию
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: 0, color: '#4f87b4', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', lineHeight: 1.1 }}>
                                Купить энергию!
                            </h3>
                            <div style={{ width: '100%', maxWidth: '380px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {ENERGY_PURCHASE_OPTIONS.map((option) => (
                                    <button
                                        key={`${option.amount}-${option.rubies}`}
                                        type="button"
                                        onClick={() => onBuyEnergyPack(option.amount, option.rubies)}
                                        disabled={playerRubies < option.rubies}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderRadius: '13px', border: `1px solid ${playerRubies < option.rubies ? '#5a5a5a' : '#2d6811'}`, background: playerRubies < option.rubies ? 'linear-gradient(180deg, #7f7f7f 0%, #5b5b5b 100%)' : 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '18px', lineHeight: 1, padding: '9px 16px', boxShadow: playerRubies < option.rubies ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.18)' : 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)', cursor: playerRubies < option.rubies ? 'not-allowed' : 'pointer' }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={energyBatteryImageUrl} alt="" aria-hidden="true" style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }} />
                                            <span>+{option.amount}</span>
                                        </span>
                                        <span>За {option.rubies} {option.rubies > 1 ? 'рубина' : 'рубин'}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const EnergyModal = React.memo(EnergyModalComponent, (prev, next) => {
    if (!prev.state && !next.state) return true;
    return (
        prev.state?.mode === next.state?.mode &&
        prev.state?.requiredEnergy === next.state?.requiredEnergy &&
        prev.playerRubies === next.playerRubies
    );
});

export interface RubyModalProps {
    state: { mode: 'warning' | 'shop'; requiredRubies?: number } | null;
    onClose: () => void;
    onOpenShop: () => void;
}

const RubyModalComponent: React.FC<RubyModalProps> = ({
    state,
    onClose,
    onOpenShop
}) => {
    if (!state) return null;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', aspectRatio: '1256 / 897', maxHeight: 'calc(100vh - 32px)' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно рубинов"
                    style={{ right: '7.06%', top: '8.91%', transform: 'translate(50%, -50%)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center justify-center text-center" style={{ width: '88%', height: '84%', padding: '8px 24px', boxSizing: 'border-box' }}>
                    <div style={{ border: '2.5px solid #d2b168', borderRadius: '10px', boxShadow: '0 0 0 2px rgba(255,105,180,0.16), 0 6px 16px rgba(0,0,0,0.30)', overflow: 'hidden', width: '84px', minWidth: '84px', height: '84px', background: 'linear-gradient(180deg, #f8f1df 0%, #eadbbd 100%)', padding: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={rubyImageUrl} alt="Рубины" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    {state.mode === 'warning' ? (
                        <>
                            <h3 style={{ margin: 0, color: '#c95d2d', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '24px', lineHeight: 1.1 }}>
                                Мэр у вас недостаточно рубинов!
                            </h3>
                            <p style={{ margin: '8px 0 16px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: 1.35, whiteSpace: 'pre-line' }}>
                                {`Вы можете купить рубины тут.${state.requiredRubies ? `\n\nТребуется: ${state.requiredRubies} рубинов` : ''}`}
                            </p>
                            <button
                                onClick={onOpenShop}
                                style={{ minWidth: '240px', borderRadius: '16px', border: '1px solid #2d6811', background: 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1, padding: '12px 24px', boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)' }}
                            >
                                Купить Рубины!
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: 0, color: '#4f87b4', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '24px', lineHeight: 1.1 }}>
                                Купить рубины!
                            </h3>
                            <p style={{ margin: '10px 0 14px', color: '#60a5fa', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '16px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                {'Покачто рубины можно купить через личку в телеграмме вот мой линк\n@BTCtokenbanker напиши мне по поводу покупки рубинов'}
                            </p>
                            <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    type="button"
                                    disabled
                                    style={{ width: '100%', borderRadius: '14px', border: '1px solid #5a5a5a', background: 'linear-gradient(180deg, #7f7f7f 0%, #5b5b5b 100%)', color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '18px', lineHeight: 1.2, padding: '11px 16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.18)', cursor: 'not-allowed' }}
                                >
                                    Посмотри рекламу и получи рубин
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const RubyModal = React.memo(RubyModalComponent, (prev, next) => {
    if (!prev.state && !next.state) return true;
    return (
        prev.state?.mode === next.state?.mode &&
        prev.state?.requiredRubies === next.state?.requiredRubies
    );
});

export interface BuildingLimitModalProps {
    data: { currentLimit: number; nextLimit: number } | null;
    onClose: () => void;
    onBuyBuildingPermit: (permitCount: 1 | 5 | 10) => void;
    isBuyingBuildingPermit: boolean;
    playerRubies: number;
}

const PERMIT_PACK_OPTIONS: ReadonlyArray<{ count: 1 | 5 | 10; cost: number }> = [
    { count: 1, cost: 1 },
    { count: 5, cost: 5 },
    { count: 10, cost: 10 },
];

const BuildingLimitModalComponent: React.FC<BuildingLimitModalProps> = ({
    data,
    onClose,
    onBuyBuildingPermit,
    isBuyingBuildingPermit,
    playerRubies
}) => {
    if (!data) return null;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', aspectRatio: '1256 / 897', maxHeight: 'calc(100vh - 32px)' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно лимита строительства"
                    style={{ right: '7.06%', top: '8.91%', transform: 'translate(50%, -50%)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center justify-center text-center" style={{ width: '88%', height: '84%', padding: '8px 24px', boxSizing: 'border-box' }}>
                    <div style={{ border: '2.5px solid #d4af37', borderRadius: '10px', boxShadow: '0 0 0 2px rgba(255,215,0,0.20), 0 6px 16px rgba(0,0,0,0.35)', overflow: 'hidden', width: '92px', minWidth: '92px', height: '116px', background: '#f6f0dc', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={permitGuideImageUrl} alt="Permit Guide" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center top', background: '#f6f0dc' }} />
                    </div>
                    <h3 style={{ margin: 0, color: '#d7291f', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '21px', lineHeight: 1.1 }}>
                        Требуеться разрешение
                        <br />
                        на строительство здания
                    </h3>
                    <p style={{ margin: '6px 0 10px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '14px', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                        {`Наш город не резиновый и мэр вынужден ограничить\nстроительство У вас сейчас есть разрешение на постройку только ${data.currentLimit} здания`}
                    </p>
                    <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                        {PERMIT_PACK_OPTIONS.map(({ count, cost }) => {
                            const disabled = isBuyingBuildingPermit || playerRubies < cost;
                            const nextTotal = data.currentLimit + count;
                            const label = count === 1
                                ? `${cost} Купить разрешение на ${nextTotal} здания`
                                : `${cost} Купить +${count} (до ${nextTotal})`;
                            return (
                                <button
                                    key={count}
                                    onClick={() => onBuyBuildingPermit(count)}
                                    disabled={disabled}
                                    style={{
                                        flex: count === 1 ? '1 1 100%' : '1 1 calc(50% - 4px)',
                                        minWidth: count === 1 ? '280px' : '160px',
                                        borderRadius: '14px',
                                        border: '1px solid #2f6b12',
                                        background: 'linear-gradient(180deg, #8fd94e 0%, #4ea91d 45%, #2f7a10 100%)',
                                        color: '#ffffff',
                                        fontFamily: 'Nunito, sans-serif',
                                        fontWeight: 900,
                                        fontSize: count === 1 ? '17px' : '15px',
                                        lineHeight: 1.1,
                                        padding: count === 1 ? '10px 18px' : '9px 12px',
                                        boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.7), inset 0 -2px 0 rgba(28,73,8,0.45), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.34)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: disabled ? 0.55 : 1,
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <img src={rubyImageUrl} alt="Ruby" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BuildingLimitModal = React.memo(BuildingLimitModalComponent, (prev, next) => {
    if (!prev.data && !next.data) return true;
    return (
        prev.data?.currentLimit === next.data?.currentLimit &&
        prev.data?.nextLimit === next.data?.nextLimit &&
        prev.isBuyingBuildingPermit === next.isBuyingBuildingPermit &&
        prev.playerRubies === next.playerRubies
    );
});
