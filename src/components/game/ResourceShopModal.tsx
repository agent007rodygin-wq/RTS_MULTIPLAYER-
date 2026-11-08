import React, { memo, useState, useMemo, useCallback } from 'react';
import type { Item } from '../../../types';

export type ResourceShopCategory = 'resources' | 'gryadki' | 'bombs' | 'monsters';

export const RESOURCE_SHOP_TABS: Array<{ id: ResourceShopCategory; label: string }> = [
    { id: 'resources', label: 'Ресурсы' },
    { id: 'gryadki', label: 'Грядки' },
    { id: 'bombs', label: 'Бомбы' },
    { id: 'monsters', label: 'Монстры' },
];

export const MONSTER_SHOP_ITEM_IDS = new Set<number>([10007, 10018]);
export const BOMB_SHOP_ITEM_IDS = new Set<number>([10010, 10011, 10012, 10013, 10015, 10016, 10017, 10043, 10045]);
export const GRYADKI_SHOP_ITEM_IDS = new Set<number>([10003, 10004, 10021, 10024, 10027, 10030]);
export const HIDDEN_DUPLICATE_RESOURCE_SHOP_ITEM_IDS = new Set<number>([10042, 10044]);

export interface ResourceShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerRubies: number;
    rubyImageUrl?: string;
    itemData: Item[];
    playCloseSound?: () => void;
    onOpenExchange: () => void;
    onBuyShopItem: (item: Item, quantity: number) => void;
}

export const ResourceShopModal: React.FC<ResourceShopModalProps> = memo(({
    isOpen,
    onClose,
    playerRubies,
    rubyImageUrl = '/Gui/Front/значек рубинов/Nj7hb.webp',
    itemData,
    playCloseSound,
    onOpenExchange,
    onBuyShopItem
}) => {
    if (!isOpen) return null;

    const [activeCategory, setActiveCategory] = useState<ResourceShopCategory>('resources');
    const [shopQuantities, setShopQuantities] = useState<Record<number, number | ''>>({});
    const [pressedButtons, setPressedButtons] = useState<Record<string, boolean>>({});

    const triggerButtonPress = useCallback((buttonId: string) => {
        setPressedButtons(prev => ({ ...prev, [buttonId]: true }));
        setTimeout(() => {
            setPressedButtons(prev => {
                const next = { ...prev };
                delete next[buttonId];
                return next;
            });
        }, 250);
    }, []);

    const handleClose = () => {
        onClose();
        if (playCloseSound) playCloseSound();
    };

    const filteredItems = useMemo(() => {
        return itemData.filter((item) => {
            if (!item.rubyPackQuantity) return false;

            if (activeCategory === 'monsters') {
                return MONSTER_SHOP_ITEM_IDS.has(item.id);
            }

            if (activeCategory === 'bombs') {
                return BOMB_SHOP_ITEM_IDS.has(item.id);
            }

            if (activeCategory === 'gryadki') {
                return GRYADKI_SHOP_ITEM_IDS.has(item.id);
            }

            return !MONSTER_SHOP_ITEM_IDS.has(item.id)
                && !BOMB_SHOP_ITEM_IDS.has(item.id)
                && !GRYADKI_SHOP_ITEM_IDS.has(item.id)
                && !HIDDEN_DUPLICATE_RESOURCE_SHOP_ITEM_IDS.has(item.id);
        });
    }, [itemData, activeCategory]);

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
                        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>Магазин ресурсов</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute"
                        style={{
                            right: '-19.5px',
                            top: '7.5px',
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

                {/* Ruby balance + Exchange button bar */}
                <div className="flex items-center justify-between" style={{ padding: '0 8px', marginBottom: '8px' }}>
                    <button
                        onClick={() => {
                            triggerButtonPress('shop-exchange-open');
                            onOpenExchange();
                        }}
                        style={{
                            background: 'linear-gradient(180deg, rgba(34,197,94,0.88) 0%, rgba(22,163,74,0.82) 100%)',
                            borderRadius: '10px',
                            border: '1px solid rgba(134,239,172,0.45)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            padding: '6px 16px',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#f0fdf4',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.25s ease',
                            opacity: pressedButtons['shop-exchange-open'] ? 0.4 : 1,
                            boxShadow: '0 6px 18px rgba(22,163,74,0.22), inset 0 1px 0 rgba(255,255,255,0.18)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(74,222,128,0.95) 0%, rgba(34,197,94,0.88) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(187,247,208,0.75)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(34,197,94,0.88) 0%, rgba(22,163,74,0.82) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(134,239,172,0.45)';
                        }}
                    >
                        <span>↔</span> Обменять
                    </button>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: '#9ca3af' }}>Ваши рубины:</span>
                        <img src={rubyImageUrl} alt="Ruby" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontWeight: 800, color: '#e0e8f0' }}>{playerRubies}</span>
                    </div>
                </div>

                <div className="flex gap-2" style={{ padding: '0 8px', marginBottom: '10px' }}>
                    {RESOURCE_SHOP_TABS.map((tab) => {
                        const isActive = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategory(tab.id)}
                                style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    border: isActive ? '1px solid rgba(147,197,253,0.8)' : '1px solid rgba(255,255,255,0.1)',
                                    background: isActive
                                        ? 'linear-gradient(180deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.88) 100%)'
                                        : 'rgba(15,23,42,0.45)',
                                    color: isActive ? '#ffffff' : '#d1d5db',
                                    fontFamily: 'Nunito, sans-serif',
                                    fontWeight: 800,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isActive
                                        ? '0 8px 18px rgba(37,99,235,0.26), inset 0 1px 0 rgba(255,255,255,0.18)'
                                        : 'none'
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filteredItems.map(item => {
                            const rawQty = shopQuantities[item.id];
                            const qty = (typeof rawQty === 'number' && rawQty >= 1) ? rawQty : 1;
                            const totalItems = item.rubyPackQuantity! * qty;
                            const isPressed = pressedButtons[`shop-buy-${item.id}`];
                            const canAfford = playerRubies >= qty;
                            return (
                                <div key={item.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px', border: '2px solid rgba(255,255,255,0.07)', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '100%', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                        <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 700, color: '#d0d8e0', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{item.name}</p>
                                    <div style={{ marginTop: 'auto', width: '100%' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px 4px', marginBottom: '4px', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: '#9ca3af' }}>
                                            x{item.rubyPackQuantity} за 1 <span style={{ color: '#f472b6' }}>₽</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '3px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShopQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (typeof prev[item.id] === 'number' ? (prev[item.id] as number) : 1) - 1) }))}
                                                style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Уменьшить на 1"
                                            >-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={rawQty !== undefined ? rawQty : ''}
                                                placeholder="1"
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setShopQuantities(prev => ({ ...prev, [item.id]: '' }));
                                                        return;
                                                    }
                                                    const parsed = parseInt(val, 10);
                                                    if (!isNaN(parsed)) {
                                                        setShopQuantities(prev => ({ ...prev, [item.id]: Math.max(0, Math.min(1000000, parsed)) }));
                                                    }
                                                }}
                                                onBlur={() => {
                                                    setShopQuantities(prev => {
                                                        const curr = prev[item.id];
                                                        if (curr === '' || curr === 0 || typeof curr !== 'number') {
                                                            return { ...prev, [item.id]: 1 };
                                                        }
                                                        return prev;
                                                    });
                                                }}
                                                style={{ flex: 1, minWidth: 0, width: '100%', background: 'rgba(0,0,0,0.4)', color: '#e0e8f0', textAlign: 'center', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', padding: '2px', fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 700 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShopQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (typeof prev[item.id] === 'number' ? (prev[item.id] as number) : 1) + 1) }))}
                                                style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Увеличить на 1"
                                            >+</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', marginBottom: '4px' }}>
                                            {[10, 50, 100, 1000].map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setShopQuantities(prev => ({ ...prev, [item.id]: preset }))}
                                                    style={{
                                                        background: qty === preset ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)',
                                                        border: `1px solid ${qty === preset ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.08)'}`,
                                                        borderRadius: '4px',
                                                        color: qty === preset ? '#93c5fd' : '#9ca3af',
                                                        fontSize: '9px',
                                                        fontWeight: 700,
                                                        padding: '2px 0',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {preset >= 1000 ? '1000' : preset}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                triggerButtonPress(`shop-buy-${item.id}`);
                                                onBuyShopItem(item, qty);
                                            }}
                                            style={{
                                                width: '100%',
                                                background: !canAfford
                                                    ? 'linear-gradient(180deg, rgba(239,68,68,0.4) 0%, rgba(185,28,28,0.3) 100%)'
                                                    : 'linear-gradient(180deg, rgba(34,197,94,0.9) 0%, rgba(21,128,61,0.85) 100%)',
                                                borderRadius: '8px',
                                                border: `1px solid ${!canAfford ? 'rgba(239,68,68,0.5)' : 'rgba(134,239,172,0.45)'}`,
                                                backdropFilter: 'blur(10px)',
                                                padding: '5px 4px',
                                                fontFamily: 'Nunito, sans-serif',
                                                fontWeight: 700,
                                                fontSize: '11px',
                                                color: !canAfford ? '#fca5a5' : '#f0fdf4',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                transition: 'all 0.25s ease',
                                                opacity: isPressed ? 0.4 : 1,
                                                boxShadow: !canAfford ? 'none' : '0 6px 18px rgba(22,163,74,0.18), inset 0 1px 0 rgba(255,255,255,0.18)'
                                            }}
                                        >
                                            <span>Купить {totalItems} шт.</span>
                                            <span style={{ fontSize: '9px', opacity: 0.85 }}>Цена: {qty} ₽ {!canAfford && `(нужно еще ${qty - playerRubies} 💎)`}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    return (
        prev.playerRubies === next.playerRubies &&
        prev.itemData === next.itemData
    );
});

ResourceShopModal.displayName = 'ResourceShopModal';
