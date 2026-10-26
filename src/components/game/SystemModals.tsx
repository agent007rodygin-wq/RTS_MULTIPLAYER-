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

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', height: 'min(490px, calc(100vh - 32px))' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно энергии"
                    style={{ right: '35px', top: '42px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center text-center" style={{ width: '620px', padding: '46px 52px 36px' }}>
                    <div style={{ border: '3px solid #d2b168', borderRadius: '12px', boxShadow: '0 0 0 2px rgba(255,215,0,0.16), 0 8px 22px rgba(0,0,0,0.30)', overflow: 'hidden', width: '138px', minWidth: '138px', height: '138px', background: 'linear-gradient(180deg, #f8f1df 0%, #eadbbd 100%)', padding: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={energyBatteryImageUrl} alt="Энергия" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    {state.mode === 'warning' ? (
                        <>
                            <h3 style={{ margin: 0, color: '#c95d2d', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.08 }}>
                                У вас недостаточно энергии!
                            </h3>
                            <p style={{ margin: '16px 0 24px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '19px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                                {`Вы можете немного подождать.\nЭнергия пополняется по 10 в минуту\nили купить ее за рубины${state.requiredEnergy ? `\n\nТребуется: ${state.requiredEnergy} энергии` : ''}`}
                            </p>
                            <button
                                onClick={onOpenShop}
                                style={{ minWidth: '270px', borderRadius: '18px', border: '1px solid #2d6811', background: 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', lineHeight: 1, padding: '14px 26px', boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)' }}
                            >
                                Купить энергию
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: 0, color: '#4f87b4', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.08 }}>
                                Купить энергию!
                            </h3>
                            <div style={{ width: '100%', maxWidth: '370px', marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {ENERGY_PURCHASE_OPTIONS.map((option) => (
                                    <button
                                        key={`${option.amount}-${option.rubies}`}
                                        type="button"
                                        onClick={() => onBuyEnergyPack(option.amount, option.rubies)}
                                        disabled={playerRubies < option.rubies}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderRadius: '16px', border: `1px solid ${playerRubies < option.rubies ? '#5a5a5a' : '#2d6811'}`, background: playerRubies < option.rubies ? 'linear-gradient(180deg, #7f7f7f 0%, #5b5b5b 100%)' : 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '21px', lineHeight: 1, padding: '12px 16px', boxShadow: playerRubies < option.rubies ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.18)' : 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)', cursor: playerRubies < option.rubies ? 'not-allowed' : 'pointer' }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={energyBatteryImageUrl} alt="" aria-hidden="true" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '5px', flexShrink: 0 }} />
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
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', height: 'min(490px, calc(100vh - 32px))' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно рубинов"
                    style={{ right: '35px', top: '42px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center text-center" style={{ width: '620px', padding: '46px 52px 36px' }}>
                    <div style={{ border: '3px solid #d2b168', borderRadius: '12px', boxShadow: '0 0 0 2px rgba(255,105,180,0.16), 0 8px 22px rgba(0,0,0,0.30)', overflow: 'hidden', width: '138px', minWidth: '138px', height: '138px', background: 'linear-gradient(180deg, #f8f1df 0%, #eadbbd 100%)', padding: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={rubyImageUrl} alt="Рубины" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    {state.mode === 'warning' ? (
                        <>
                            <h3 style={{ margin: 0, color: '#c95d2d', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.08 }}>
                                Мэр у вас недостаточно рубинов!
                            </h3>
                            <p style={{ margin: '16px 0 24px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '19px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                                {`Вы можете купить рубины тут.${state.requiredRubies ? `\n\nТребуется: ${state.requiredRubies} рубинов` : ''}`}
                            </p>
                            <button
                                onClick={onOpenShop}
                                style={{ minWidth: '270px', borderRadius: '18px', border: '1px solid #2d6811', background: 'linear-gradient(180deg, #92cd58 0%, #4f9d27 46%, #387e16 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', lineHeight: 1, padding: '14px 26px', boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.62), inset 0 -2px 0 rgba(28,73,8,0.38), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.30)' }}
                            >
                                Купить Рубины!
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 style={{ margin: 0, color: '#4f87b4', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.08 }}>
                                Купить рубины!
                            </h3>
                            <p style={{ margin: '20px 0 24px', color: '#60a5fa', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '20px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                {'Покачто рубины можно купить через личку в телеграмме вот мой линк\n@BTCtokenbanker напиши мне по поводу покупки рубинов'}
                            </p>
                            <div style={{ width: '100%', maxWidth: '390px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    type="button"
                                    disabled
                                    style={{ width: '100%', borderRadius: '16px', border: '1px solid #5a5a5a', background: 'linear-gradient(180deg, #7f7f7f 0%, #5b5b5b 100%)', color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, padding: '14px 18px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.18)', cursor: 'not-allowed' }}
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
    onBuyBuildingPermit: () => void;
    isBuyingBuildingPermit: boolean;
    playerRubies: number;
}

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
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', height: 'min(490px, calc(100vh - 32px))' }}>
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <button
                    onClick={onClose}
                    className="absolute z-10"
                    aria-label="Закрыть окно лимита строительства"
                    style={{ right: '35px', top: '42px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />
                <div className="relative z-[1] flex flex-col items-center text-center" style={{ width: '620px', padding: '46px 52px 36px' }}>
                    <div style={{ border: '3px solid #d4af37', borderRadius: '12px', boxShadow: '0 0 0 2px rgba(255,215,0,0.20), 0 8px 22px rgba(0,0,0,0.35)', overflow: 'hidden', width: '170px', minWidth: '170px', height: '220px', background: '#f6f0dc', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={permitGuideImageUrl} alt="Permit Guide" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center top', background: '#f6f0dc' }} />
                    </div>
                    <h3 style={{ margin: 0, color: '#d7291f', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.08 }}>
                        Требуеться разрешение
                        <br />
                        на строительство здания
                    </h3>
                    <p style={{ margin: '16px 0 24px', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '19px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                        {`Наш город не резиновый и мэр вынужден ограничить\nстроительство У вас сейчас есть разрешение на постройку только ${data.currentLimit} здания`}
                    </p>
                    <button
                        onClick={onBuyBuildingPermit}
                        disabled={isBuyingBuildingPermit || playerRubies < 1}
                        style={{ minWidth: '360px', borderRadius: '18px', border: '1px solid #2f6b12', background: 'linear-gradient(180deg, #8fd94e 0%, #4ea91d 45%, #2f7a10 100%)', color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', lineHeight: 1, padding: '14px 26px', boxShadow: 'inset 0 1px 0 rgba(235,255,220,0.7), inset 0 -2px 0 rgba(28,73,8,0.45), 0 3px 0 #2d6912, 0 7px 12px rgba(0,0,0,0.34)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <img src={rubyImageUrl} alt="Ruby" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        <span>{`1 Купить разрешение на ${data.nextLimit} здания`}</span>
                    </button>
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
