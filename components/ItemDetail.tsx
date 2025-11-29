
import React from 'react';
import { Item, ResourceInfo } from '../types';

interface ItemDetailProps {
  item: Item;
  onSelectEntity: (entity: {id: number, type: 'item' | 'building'}) => void;
}

const ResourceList: React.FC<{title: string, resources?: ResourceInfo[], onSelectEntity: (entity: {id: number, type: 'item' | 'building'}) => void;}> = ({ title, resources, onSelectEntity }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-300 mt-4 mb-2">{title}</h3>
      <ul className="space-y-2">
        {resources.map((res, index) => (
          <li key={index} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span 
              className="text-blue-400 hover:text-blue-300 cursor-pointer" 
              onClick={() => onSelectEntity({ id: res.id, type: 'building'})} // Assume links are to buildings
            >
              {res.name}
            </span>
            <div className="flex items-center space-x-2 text-sm">
                {res.amount && <span className="font-mono bg-gray-700 px-2 py-1 rounded">{res.amount} шт.</span>}
                {res.chance && <span className="font-mono bg-purple-800/50 text-purple-300 px-2 py-1 rounded">шанс: {res.chance}%</span>}
                {res.frequency && <span className="font-mono bg-green-800/50 text-green-300 px-2 py-1 rounded">{res.frequency}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, onSelectEntity }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg h-full overflow-y-auto">
      <div className="flex items-start space-x-4">
        <img src={item.imageUrl} alt={item.name} className="w-32 h-32 rounded-lg object-cover border-2 border-gray-700"/>
        <div>
            <h2 className="text-3xl font-bold text-white">{item.name}</h2>
            {item.englishName && <p className="text-xl text-gray-400">{item.englishName}</p>}
            <p className="text-sm text-gray-500 mt-1">ID: {item.id} &bull; {item.category}</p>
        </div>
      </div>
      <p className="mt-4 text-gray-300">{item.description}</p>
      
      <ResourceList title="Требуется для постройки" resources={item.requiredFor} onSelectEntity={onSelectEntity} />
      <ResourceList title="Используется для работы" resources={item.usedInWork} onSelectEntity={onSelectEntity} />
      <ResourceList title="Производится на" resources={item.producedBy} onSelectEntity={onSelectEntity} />
      <ResourceList title="Иногда производится на" resources={item.sometimesProducedBy} onSelectEntity={onSelectEntity} />
      <ResourceList title="Выпадает из" resources={item.dropsFrom} onSelectEntity={onSelectEntity} />
    </div>
  );
};

export default ItemDetail;
