
import React, { useState } from 'react';
import { Building, ResourceInfo } from '../types';
import { generateBuildingDescription } from '../services/geminiService';
import { SparklesIcon } from './IconComponents';

interface BuildingDetailProps {
  building: Building;
  onSelectEntity: (entity: { id: number; type: 'item' | 'building' }) => void;
}

const DetailRow: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => {
    if (value === null || value === undefined) return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-700/50">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    );
};

const ResourceList: React.FC<{ title: string; resources?: ResourceInfo[]; onSelectEntity: (entity: { id: number; type: 'item' | 'building' }) => void; }> = ({ title, resources, onSelectEntity }) => {
    if (!resources || resources.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold text-blue-300 mt-3 mb-1">{title}</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
                {resources.map((res, index) => (
                    <li key={index}>
                        <span
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            onClick={() => onSelectEntity({ id: res.id, type: 'item' })}
                        >
                            {res.name}
                        </span>
                        {res.amount && `: ${res.amount} шт.`}
                        {res.chance && <span className="text-xs text-gray-500 ml-2">({res.chance}%)</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const BuildingDetail: React.FC<BuildingDetailProps> = ({ building, onSelectEntity }) => {
    const [genDescription, setGenDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGenerateDescription = async () => {
        setIsLoading(true);
        setGenDescription('');
        const desc = await generateBuildingDescription(building);
        setGenDescription(desc);
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg h-full overflow-y-auto">
            <div className="flex items-start space-x-4">
                <img src={building.imageUrl} alt={building.name} className="w-32 h-32 rounded-lg object-cover border-2 border-gray-700" />
                <div>
                    <h2 className="text-3xl font-bold text-white">{building.name}</h2>
                    {building.englishName && <p className="text-xl text-gray-400">{building.englishName}</p>}
                    <p className="text-sm text-gray-500 mt-1">ID: {building.id} &bull; {building.category}</p>
                </div>
            </div>

            <p className="mt-4 text-gray-300 italic">{building.description}</p>
            
            <div className="my-4">
                <button
                    onClick={handleGenerateDescription}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Генерация...' : 'Сгенерировать описание с Gemini'}
                </button>
                {genDescription && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-purple-500/50">
                        <p className="text-purple-200">{genDescription}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Характеристики</h3>
                    <div className="text-sm space-y-1">
                        <DetailRow label="Цена" value={building.price ? `${building.price.toLocaleString()} монет` : (building.rubyPrice ? `${building.rubyPrice} рубинов` : 'N/A')} />
                        <DetailRow label="Прочность" value={building.stats.durability} />
                        <DetailRow label="Слава при взрыве" value={building.stats.gloryOnExplosion} />
                        <DetailRow label="Даёт населения" value={building.stats.populationBonus} />
                        <DetailRow label="Требует населения" value={building.stats.takesPopulation} />
                        <DetailRow label="Даёт разрешений" value={building.stats.permits} />
                        <DetailRow label="Время строительства (сек)" value={building.stats.constructionTimeSeconds} />
                        <DetailRow label="Ускорение (руб)" value={building.stats.accelerationCost} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Требования</h3>
                    <ResourceList title="Ресурсы для постройки" resources={building.constructionRequirements.resources} onSelectEntity={onSelectEntity} />
                    {building.constructionRequirements.population && <DetailRow label="Население для постройки" value={building.constructionRequirements.population} />}
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-blue-300 mb-2">Производство</h3>
                    <ResourceList title="Производит" resources={building.stats.produces} onSelectEntity={onSelectEntity} />
                    <ResourceList title="Потребляет" resources={building.stats.consumes} onSelectEntity={onSelectEntity} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Дроп при уничтожении</h3>
                    <ResourceList title="Часто" resources={building.drops.frequent} onSelectEntity={onSelectEntity} />
                    <ResourceList title="Редко" resources={building.drops.rare} onSelectEntity={onSelectEntity} />
                    <DetailRow label="Выпадает монет" value={building.stats.givesCoins} />
                </div>
            </div>

            {building.destructionInfo && building.destructionInfo.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Информация об уничтожении</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2">Оружие</th>
                                    <th className="px-4 py-2">Кол-во</th>
                                    <th className="px-4 py-2">Время</th>
                                    <th className="px-4 py-2">Урон</th>
                                </tr>
                            </thead>
                            <tbody>
                                {building.destructionInfo.map((info, i) => (
                                    <tr key={i} className="bg-gray-800/50 border-b border-gray-700/50">
                                        <td className="px-4 py-2 font-medium">{info.weaponName}</td>
                                        <td className="px-4 py-2">{info.amount}</td>
                                        <td className="px-4 py-2">{info.timeSeconds} сек</td>
                                        <td className="px-4 py-2">{info.damage || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildingDetail;
