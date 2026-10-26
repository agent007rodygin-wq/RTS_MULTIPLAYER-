import React, { memo } from 'react';
import { ClanIcon } from '../../../components/IconComponents';
import { ZONES_X, ZONES_Y, ZONE_SIZE } from '../../world.js';
import type { Building, PlacedBuilding } from '../../../types';

export interface WorldMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    townHallLocation: { x: number; y: number } | null;
    placedBuildings: PlacedBuilding[];
    buildingData: Building[];
    playCloseSound: () => void;
}

const WorldMapModalComponent: React.FC<WorldMapModalProps> = ({
    isOpen,
    onClose,
    townHallLocation,
    placedBuildings,
    buildingData,
    playCloseSound
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        playCloseSound();
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div className="relative flex flex-col" onClick={(e) => e.stopPropagation()} style={{ backgroundImage: 'url(/Gui/build_menu_bg.webp)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', width: 'min(var(--ui-modal-width), calc(100vw - 32px))', height: 'min(var(--ui-modal-height), calc(100vh - 32px))', padding: 'var(--ui-modal-padding-top) var(--ui-modal-padding-right) var(--ui-modal-padding-bottom) var(--ui-modal-padding-left)', overflow: 'hidden' }}>
                {/* Title centered + close button */}
                <div className="flex items-center justify-center relative" style={{ padding: '0 8px', marginTop: '10px', marginBottom: '4px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '7px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>Карта мира</h2>
                    </div>
                    <button onClick={handleClose} className="absolute" style={{ right: '-23px', top: '3px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55), 0 0 36px 12px rgba(96,165,250,0.25), inset 0 0 12px rgba(150,200,255,0.35)'; e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.4) 0%, rgba(60,130,220,0.2) 60%, transparent 100%)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)'; e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                    >
                    </button>
                </div>
                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ZONES_X}, 1fr)` }}>
                        {Array.from({ length: ZONES_X * ZONES_Y }).map((_, index) => {
                            const row = Math.floor(index / ZONES_X);
                            const col = index % ZONES_X;

                            const hasTownHall = townHallLocation &&
                                Math.floor(townHallLocation.x / ZONE_SIZE) === col &&
                                Math.floor(townHallLocation.y / ZONE_SIZE) === row;

                            const clanCastle = placedBuildings.find(b => {
                                const info = buildingData.find(i => i.id === b.buildingId);
                                return info && info.category === 'Клан' &&
                                    Math.floor(b.x / ZONE_SIZE) === col &&
                                    Math.floor(b.y / ZONE_SIZE) === row;
                            });

                            return (
                                <div
                                    key={index}
                                    style={{ width: '96px', height: '96px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: clanCastle ? 'rgba(180,40,40,0.25)' : 'rgba(0,0,0,0.25)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    title={`Зона ${col + 1}-${row + 1}`}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = clanCastle ? 'rgba(180,40,40,0.35)' : 'rgba(255,255,255,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = clanCastle ? 'rgba(180,40,40,0.25)' : 'rgba(0,0,0,0.25)'; }}
                                >
                                    <span style={{ position: 'absolute', top: '3px', left: '4px', fontFamily: 'Nunito, sans-serif', fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>{col + 1}-{row + 1}</span>

                                    {hasTownHall && (
                                        <span className="animate-pulse" style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="Ваш город">⭐</span>
                                    )}

                                    {clanCastle && (
                                        <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f87171' }}>
                                            <ClanIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
                        Звездочкой отмечено ваше главное здание. Замки обозначают владения кланов.
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorldMapModal = memo(WorldMapModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.townHallLocation?.x !== next.townHallLocation?.x || prev.townHallLocation?.y !== next.townHallLocation?.y) return false;
    return true;
});
