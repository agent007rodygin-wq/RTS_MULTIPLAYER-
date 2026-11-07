import React, { memo } from 'react';
import { ClanIcon } from '../../../components/IconComponents';
import { ZONES_X, ZONES_Y, ZONE_SIZE } from '../../world.js';
import type { Building, PlacedBuilding, Clan } from '../../../types';

export interface WorldMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    townHallLocation: { x: number; y: number } | null;
    placedBuildings: PlacedBuilding[];
    buildingData: Building[];
    playCloseSound: () => void;
    clans?: Clan[];
    allUsers?: Record<string, any>;
    currentClan?: Clan | null;
    currentUserUid?: string;
}

const WATCHTOWER_IDS = [801, 214, 215, 216];

const WorldMapModalComponent: React.FC<WorldMapModalProps> = ({
    isOpen,
    onClose,
    townHallLocation,
    placedBuildings,
    buildingData,
    playCloseSound,
    clans = [],
    allUsers = {},
    currentClan = null,
    currentUserUid
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
                    <button onClick={handleClose} className="absolute" style={{ right: '-19.5px', top: '7.5px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
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

                            // Find all clan buildings in this zone/sector
                            const sectorClanBuildings = placedBuildings.filter(b => {
                                const bCol = Math.floor(b.x / ZONE_SIZE);
                                const bRow = Math.floor(b.y / ZONE_SIZE);
                                if (bCol !== col || bRow !== row) return false;
                                if (typeof b.hp === 'number' && b.hp <= 0) return false;
                                const info = buildingData.find(i => i.id === b.buildingId);
                                return (
                                    info?.category === 'Клан' ||
                                    WATCHTOWER_IDS.includes(Number(b.buildingId)) ||
                                    (info?.name && (info.name.includes('Бандитский замок') || info.name.includes('Сторожевая башня')))
                                );
                            });

                            // Primary clan building: prefer Bandit Castle, then Watchtower, then first clan building
                            const primaryClanBuilding = sectorClanBuildings.find(b => {
                                const info = buildingData.find(i => i.id === b.buildingId);
                                return info?.name && info.name.includes('Бандитский замок');
                            }) || sectorClanBuildings.find(b => WATCHTOWER_IDS.includes(Number(b.buildingId))) || sectorClanBuildings[0];

                            // Resolve clan occupying this sector
                            let sectorClan: Clan | null = null;
                            if (primaryClanBuilding && clans && clans.length > 0) {
                                const ownerIdStr = String(primaryClanBuilding.ownerId || '');
                                if (currentUserUid && (ownerIdStr === currentUserUid || ownerIdStr === '0')) {
                                    sectorClan = currentClan || clans.find(c => c.leaderUid === currentUserUid) || null;
                                }
                                if (!sectorClan && ownerIdStr && ownerIdStr !== '0') {
                                    sectorClan = clans.find(c => c.leaderUid === ownerIdStr) || null;
                                    if (!sectorClan && allUsers && allUsers[ownerIdStr]?.clanId) {
                                        const uClanId = Number(allUsers[ownerIdStr].clanId);
                                        sectorClan = clans.find(c => Number(c.id) === uClanId) || null;
                                    }
                                }
                                // Fallback: try other clan buildings in this zone
                                if (!sectorClan) {
                                    for (const b of sectorClanBuildings) {
                                        const oId = String(b.ownerId || '');
                                        if (oId && oId !== '0') {
                                            const found = clans.find(c => c.leaderUid === oId) ||
                                                (allUsers && allUsers[oId]?.clanId ? clans.find(c => Number(c.id) === Number(allUsers[oId].clanId)) : null);
                                            if (found) {
                                                sectorClan = found;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            const isOccupiedByClan = Boolean(sectorClan || primaryClanBuilding);

                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: '96px',
                                        height: '96px',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        background: isOccupiedByClan ? 'rgba(180,40,40,0.25)' : 'rgba(0,0,0,0.25)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        overflow: 'hidden',
                                        padding: '4px'
                                    }}
                                    title={`Сектор ${col + 1}-${row + 1}${sectorClan ? ` • Клан: ${sectorClan.name}` : primaryClanBuilding ? ' • Владения клана' : ''}${hasTownHall ? ' • Ваш город' : ''}`}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                                        e.currentTarget.style.background = isOccupiedByClan ? 'rgba(180,40,40,0.35)' : 'rgba(255,255,255,0.08)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.background = isOccupiedByClan ? 'rgba(180,40,40,0.25)' : 'rgba(0,0,0,0.25)';
                                    }}
                                >
                                    {/* Sector label in top-left */}
                                    <span style={{ position: 'absolute', top: '3px', left: '4px', fontFamily: 'Nunito, sans-serif', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', zIndex: 2 }}>
                                        {col + 1}-{row + 1}
                                    </span>

                                    {/* Town Hall Star badge */}
                                    {hasTownHall && (
                                        <span
                                            className="animate-pulse"
                                            style={
                                                isOccupiedByClan
                                                    ? { position: 'absolute', top: '2px', right: '4px', fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))', zIndex: 3 }
                                                    : { fontSize: '26px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }
                                            }
                                            title="Ваш город"
                                        >
                                            ⭐
                                        </span>
                                    )}

                                    {/* Clan Emblem in the center of the sector */}
                                    {isOccupiedByClan && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: hasTownHall ? '6px' : '0' }}>
                                            {sectorClan?.avatarUrl ? (
                                                <div style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: '1.5px solid rgba(248, 113, 113, 0.85)',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 0 10px rgba(239, 68, 68, 0.35)',
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <img
                                                        src={sectorClan.avatarUrl}
                                                        alt={sectorClan.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f87171' }}>
                                                    <ClanIcon className="w-6 h-6" />
                                                </div>
                                            )}

                                            {sectorClan?.name && (
                                                <span style={{
                                                    marginTop: '2px',
                                                    fontSize: '9px',
                                                    fontWeight: 700,
                                                    color: '#fca5a5',
                                                    fontFamily: 'Nunito, sans-serif',
                                                    maxWidth: '86px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    textAlign: 'center',
                                                    textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                                                }}>
                                                    {sectorClan.name}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
                        Звездочкой отмечено ваше главное здание. Эмблемы и замки обозначают владения кланов.
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
    if (prev.placedBuildings !== next.placedBuildings) return false;
    if (prev.clans !== next.clans) return false;
    if (prev.currentClan !== next.currentClan) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.currentUserUid !== next.currentUserUid) return false;
    return true;
});
