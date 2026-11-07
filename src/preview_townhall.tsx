import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { TownHallModal } from './components/game/TownHallModal';
import { buildings } from '../data/buildings';

const townHallInfoLvl1 = buildings.find(b => b.id === 301) || {
    id: 301,
    name: 'Городской центр',
    description: 'Центр нужен для управления городом. Чем выше уровень «Городского центра» тем больше зданий игрок может построить.',
    stats: {
        durability: 40,
        populationBonus: 8,
        permits: 5,
        increasesGoldCapacity: 500
    },
    upgradesTo: 306,
    upgradeCost: 500,
    price: 10
};

const mockPlacedTownHall = {
    id: 'mock-th-1',
    buildingId: 301,
    x: 10,
    y: 10,
    ownerId: '0',
    ownerName: 'Вы',
    isConstructing: false,
    constructionEndTime: 0,
    hp: 40,
    maxHp: 40,
    shieldHp: 0,
    shieldMaxHp: 0
};

const TownHallPreviewApp = () => {
    const params = new URLSearchParams(window.location.search);
    const isDamaged = params.get('damaged') === 'true';
    const isUpgrading = params.get('upgrading') === 'true';
    const targetLvl = params.get('lvl') === '3' ? 312 : 301;
    const currentInfo = buildings.find(b => b.id === targetLvl) || townHallInfoLvl1;
    const maxHp = currentInfo.stats?.durability || 40;

    const [building, setBuilding] = useState({
        ...mockPlacedTownHall,
        buildingId: targetLvl,
        hp: isDamaged ? Math.floor(maxHp * 0.4) : maxHp,
        maxHp: maxHp,
        isConstructing: isUpgrading,
        constructionEndTime: isUpgrading ? Date.now() + 440000 : 0
    });

    const repairCost = isDamaged ? 15 : 0;
    const canRepair = isDamaged && repairCost > 0;

    useEffect(() => {
        if (params.get('resources') === 'true') {
            const timer = setTimeout(() => {
                const btn = document.getElementById('open_resources_req_button');
                if (btn) btn.click();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="w-screen min-h-screen bg-[#090312] flex items-center justify-center relative overflow-hidden">
            {/* Background game map behind modal to clearly see transparency around dragon frame */}
            <div className="absolute inset-0 bg-emerald-950/40 pointer-events-none" />

            <TownHallModal
                building={building as any}
                info={currentInfo as any}
                onClose={() => console.log('Town hall modal closed')}
                playerGold={2500}
                playerEnergy={100}
                playerLevel={5}
                currentPopulation={12}
                maxPopulation={50}
                inventory={{ 10001: 50, 10002: 12 }}
                canRepair={canRepair}
                repairCost={repairCost}
                handleRepair={() => setBuilding(prev => ({ ...prev, hp: prev.maxHp }))}
                handleMoveClick={() => alert('Перемещение')}
                handleSell={() => alert('Продажа')}
                handleUpgrade={() => alert('Улучшение')}
                handleSpeedUp={() => alert('Построить мгновенно за рубины!')}
                rubyImageUrl="/Gui/Front/значек рубинов/Nj7hb.webp"
                playerRubies={25}
                onOpenExplosionMenu={() => alert('Меню взрыва')}
                onOpenProtectionMenu={() => alert('Меню защиты')}
                onOpenTownHallOrders={() => alert('Заказы ратуши')}
                townHallAvailableOrdersCount={3}
                buildingData={buildings as any}
            />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TownHallPreviewApp />);
