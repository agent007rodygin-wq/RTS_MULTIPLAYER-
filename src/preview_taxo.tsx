import React from 'react';
import ReactDOM from 'react-dom/client';
import { TaxiDepotModal } from './components/game/TaxiDepotModal';
import { buildings } from '../data/buildings';

const buildingInfo = buildings.find(b => b.id === 7980020) || {
    id: 7980020,
    name: 'Таксопарк',
    stats: {
        durability: 5000,
        workTimeSeconds: 1800,
        workYieldGold: 1500,
        populationBonus: 5
    }
};

const mockPlacedBuilding = {
    id: 'mock-1',
    buildingId: 7980020,
    x: 10,
    y: 10,
    ownerId: '0',
    isConstructing: false,
    constructionEndTime: 0,
    hp: 5000,
    maxHp: 5000,
    workState: 'working' as const,
    workEndTime: Date.now() + 26 * 60 * 1000 + 13 * 1000, // 26m 13s, matching concept!
};

const AppPreview = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = (params.get('tab') as any) || 'management';
    const level = parseInt(params.get('level') || '5', 10);
    const state = params.get('state') || 'idle'; // default idle to see primary button matching concept

    const placedBuildingWithLevel = {
        ...mockPlacedBuilding,
        level: level,
        workState: state === 'working' ? ('working' as const) : state === 'finished' ? ('finished' as const) : undefined,
        workEndTime: state === 'working' ? Date.now() + 26 * 60 * 1000 + 13 * 1000 : 0
    };

    return (
        <div className="w-screen min-h-screen bg-[#090312] flex items-center justify-center relative overflow-hidden">
            {/* Background game map for authentic backdrop blur */}
            <img
                src="/Gui/TaxiGui/game_map_backdrop.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-[2px] opacity-75 pointer-events-none"
            />
            <TaxiDepotModal
                building={placedBuildingWithLevel as any}
                info={buildingInfo as any}
                onClose={() => console.log('close')}
                playerGold={250000}
                playerLevel={5}
                inventory={{}}
                isMine={true}
                canRepair={false}
                repairCost={0}
                initialTab={tab}
            />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<AppPreview />);
