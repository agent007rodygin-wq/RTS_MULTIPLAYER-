import React, { memo, useMemo, useState } from 'react';
import type { Building } from '../../../types';

const RUBY_ICON_URL = '/Gui/Front/значек рубинов/Nj7hb.webp';

export interface GiftCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetPlayerId: string | null;
    targetPlayerName: string;
    playerRubies: number;
    buildingData: Building[];
    isSending: boolean;
    onSend: (building: Building) => void;
    rubyImageUrl?: string;
}

/**
 * Catalog of ruby-priced buildings that can be gifted to another player.
 * The price always comes from building.rubyPrice — the server re-validates it
 * against its own generated catalog (pb_hooks/gift_server_utils.js).
 */
export const GiftCatalogModal: React.FC<GiftCatalogModalProps> = memo(({
    isOpen,
    onClose,
    targetPlayerId,
    targetPlayerName,
    playerRubies,
    buildingData,
    isSending,
    onSend,
    rubyImageUrl = RUBY_ICON_URL
}) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [selected, setSelected] = useState<Building | null>(null);

    const giftBuildings = useMemo(() => {
        return buildingData
            .filter(b => (b.rubyPrice || 0) > 0)
            .sort((a, b) => (a.rubyPrice || 0) - (b.rubyPrice || 0) || a.id - b.id);
    }, [buildingData]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        giftBuildings.forEach(b => {
            if (b.category) set.add(b.category);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
    }, [giftBuildings]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return giftBuildings.filter(b => {
            if (category && b.category !== category) return false;
            if (query && !b.name.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [giftBuildings, category, search]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isSending) return;
        setSelected(null);
        setSearch('');
        setCategory('');
        onClose();
    };

    const handleSendClick = () => {
        if (!selected || isSending) return;
        onSend(selected);
    };

    const selectedAffordable = selected ? (selected.rubyPrice || 0) <= playerRubies : false;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[70] backdrop-blur-sm" onClick={handleClose}>
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
                {/* Close button aligned with background tablet texture X */}
                <button
                    onClick={handleClose}
                    className="absolute z-10 cursor-pointer"
                    style={{
                        right: '7.06%',
                        top: '8.91%',
                        transform: 'translate(50%, -50%)',
                        width: '36px',
                        height: '36px',
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
                    title="Закрыть"
                />

                {/* Header */}
                <div className="flex items-center justify-between relative px-3 mt-2.5 mb-2 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl">🎁</span>
                        <div className="min-w-0">
                            <p className="text-white font-extrabold text-base leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                Подарить подарок
                            </p>
                            <p className="text-xs text-pink-200/80 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                для игрока: <span className="font-bold text-pink-300">{targetPlayerName || '…'}</span>
                            </p>
                        </div>
                    </div>
                    <div
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                        style={{
                            marginRight: '48px',
                            background: 'rgba(244, 114, 182, 0.15)',
                            border: '1px solid rgba(244, 114, 182, 0.35)',
                            color: '#f9a8d4',
                            backdropFilter: 'blur(8px)'
                        }}
                        title="Ваши рубины"
                    >
                        <img src={rubyImageUrl} alt="R" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                        <span className="text-white">{Math.max(0, playerRubies).toLocaleString('ru-RU')}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 px-3 mb-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Поиск подарка…"
                        className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg text-xs text-white outline-none"
                        style={{
                            fontFamily: 'Nunito, sans-serif',
                            background: 'rgba(0,0,0,0.45)',
                            border: '1px solid rgba(255,255,255,0.12)'
                        }}
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-xs text-white outline-none cursor-pointer"
                        style={{
                            fontFamily: 'Nunito, sans-serif',
                            background: 'rgba(0,0,0,0.45)',
                            border: '1px solid rgba(255,255,255,0.12)'
                        }}
                    >
                        <option value="">Все категории</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Catalog grid */}
                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filtered.map(building => {
                            const price = building.rubyPrice || 0;
                            const affordable = price <= playerRubies;
                            const isSelected = selected?.id === building.id;
                            return (
                                <div
                                    key={building.id}
                                    onClick={() => {
                                        if (isSending) return;
                                        setSelected(isSelected ? null : building);
                                    }}
                                    className="cursor-pointer transition-all"
                                    style={{
                                        background: isSelected ? 'rgba(244, 114, 182, 0.18)' : 'rgba(0,0,0,0.28)',
                                        borderRadius: '10px',
                                        padding: '8px 6px',
                                        border: isSelected
                                            ? '1.5px solid rgba(249, 168, 212, 0.7)'
                                            : affordable
                                                ? '1.5px solid rgba(255,255,255,0.08)'
                                                : '1.5px solid rgba(255,255,255,0.04)',
                                        textAlign: 'center',
                                        position: 'relative',
                                        opacity: affordable ? 1 : 0.55,
                                        boxShadow: isSelected ? '0 0 14px rgba(244, 114, 182, 0.35)' : 'none'
                                    }}
                                    title={affordable ? `Подарить «${building.name}» за ${price} рубинов` : `Недостаточно рубинов (нужно ${price})`}
                                >
                                    <div style={{ width: '100%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                        <img
                                            src={building.imageUrl}
                                            alt={building.name}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '2px' }}
                                        />
                                    </div>
                                    <p
                                        style={{
                                            fontFamily: 'Nunito, sans-serif',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: '#d0d8e0',
                                            lineHeight: 1.2,
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}
                                    >
                                        {building.name}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <img src={rubyImageUrl} alt="R" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                                        <span
                                            style={{
                                                fontFamily: 'Nunito, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                color: affordable ? '#f472b6' : '#9ca3af'
                                            }}
                                        >
                                            {price}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <p
                                className="col-span-full text-center text-sm py-10"
                                style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(200,210,220,0.5)' }}
                            >
                                Ничего не найдено.
                            </p>
                        )}
                    </div>
                </div>

                {/* Confirm footer */}
                <div className="px-3 pt-2 pb-1">
                    {selected ? (
                        <div
                            className="rounded-xl p-3 flex items-center justify-between gap-3"
                            style={{
                                background: 'rgba(15, 23, 42, 0.85)',
                                border: '1.5px solid rgba(244, 114, 182, 0.4)'
                            }}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 p-1"
                                    style={{ background: 'rgba(244, 114, 182, 0.12)', border: '1px solid rgba(249, 168, 212, 0.3)' }}
                                >
                                    <img src={selected.imageUrl} alt={selected.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-white truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                        «{selected.name}» → {targetPlayerName || '…'}
                                    </p>
                                    <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'Nunito, sans-serif', color: selectedAffordable ? '#f472b6' : '#f87171' }}>
                                        <img src={rubyImageUrl} alt="R" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                                        {selected.rubyPrice || 0} рубинов
                                        {!selectedAffordable && <span className="text-red-400 font-bold"> — недостаточно!</span>}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSendClick}
                                disabled={!selectedAffordable || isSending}
                                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white transition-all flex-shrink-0"
                                style={{
                                    fontFamily: 'Nunito, sans-serif',
                                    background: selectedAffordable && !isSending
                                        ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                                        : 'rgba(107, 114, 128, 0.4)',
                                    border: '1px solid rgba(249, 168, 212, 0.5)',
                                    cursor: selectedAffordable && !isSending ? 'pointer' : 'not-allowed',
                                    opacity: selectedAffordable && !isSending ? 1 : 0.6
                                }}
                            >
                                {isSending ? 'Отправка…' : '🎁 Подарить'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-xs py-1" style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(200,210,220,0.6)' }}>
                            Выберите подарок — получатель сможет поставить его у себя из инвентаря.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    return (
        prevProps.targetPlayerId === nextProps.targetPlayerId &&
        prevProps.targetPlayerName === nextProps.targetPlayerName &&
        prevProps.playerRubies === nextProps.playerRubies &&
        prevProps.isSending === nextProps.isSending &&
        prevProps.buildingData === nextProps.buildingData &&
        prevProps.onSend === nextProps.onSend &&
        prevProps.onClose === nextProps.onClose
    );
});

GiftCatalogModal.displayName = 'GiftCatalogModal';
