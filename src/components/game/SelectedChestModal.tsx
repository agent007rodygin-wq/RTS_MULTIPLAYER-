import React from 'react';
import { CloseIcon, CompassIcon } from '../../../components/IconComponents';
import type { MapResource } from '../../../types';

export type ChestCollectMode = 'share' | 'private';

interface SelectedChestModalProps {
    resource: MapResource | null;
    playerId?: string;
    imageUrl: string;
    isProcessing: boolean;
    errorText?: string | null;
    onCollect: (mode: ChestCollectMode) => void;
    onClose: () => void;
}

const MAX_CHEST_COLLECTORS = 2;

function getChestMeta(resource: MapResource | null) {
    if (!resource) return null;
    if (resource.chest) return resource.chest;
    return resource.data?.chest || null;
}

/**
 * Context-aware treasure chest menu:
 * - unclaimed chest → «Собрать и поделиться» / «Собрать и не делиться»;
 * - chest shared by another player → single «Собрать» while slots remain;
 * - already collected by this player → info only.
 */
const SelectedChestModalComponent: React.FC<SelectedChestModalProps> = ({
    resource,
    playerId,
    imageUrl,
    isProcessing,
    errorText,
    onCollect,
    onClose,
}) => {
    if (!resource) return null;

    const meta = getChestMeta(resource);
    const finderId = meta?.finderId || '';
    const finderName = meta?.finderName || '';
    const collectors = Array.isArray(meta?.collectors) ? meta!.collectors! : [];
    const slotsLeft = Math.max(0, MAX_CHEST_COLLECTORS - collectors.length);
    const isMine = Boolean(finderId) && finderId === playerId;
    const isSharedByOther = Boolean(finderId) && finderId !== playerId;
    const claimedByMe = isMine || collectors.includes(playerId || '');
    const isDepleted = Boolean(finderId) && slotsLeft <= 0;

    return (
        <div
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-yellow-600/60 relative flex flex-col items-center animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-yellow-300 mb-4">Сундук с сокровищами</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Закрыть">
                    <CloseIcon className="w-7 h-7" />
                </button>

                <div className="w-32 h-32 bg-gray-900 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
                    <img src={imageUrl} alt="Сундук с сокровищами" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-gray-400 text-sm mb-4">Координаты: [{resource.x}, {resource.y}]</p>

                {finderId ? (
                    <div className="w-full text-center text-sm text-gray-300 mb-4 space-y-1">
                        <p>
                            Нашёл:{' '}
                            <span className="text-yellow-300 font-bold">{isMine ? 'вы' : finderName || 'неизвестный игрок'}</span>
                        </p>
                        <p>
                            Осталось собрать: <span className="text-green-400 font-bold">{slotsLeft}</span>
                        </p>
                        {claimedByMe && (
                            <p className="text-green-400 font-semibold">Вы уже собрали этот клад.</p>
                        )}
                        {isDepleted && !claimedByMe && (
                            <p className="text-red-400 font-semibold">Клад уже полностью разобрали.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-300 text-sm mb-4 text-center">
                        Выберите, как собрать клад. Поделённый сундук останется на карте ещё для двоих искателей.
                    </p>
                )}

                {!finderId && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={() => onCollect('share')}
                            disabled={isProcessing}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <CompassIcon className="w-8 h-8 mb-2" />
                            <span>{isProcessing ? 'Сбор...' : 'Собрать и поделиться'}</span>
                            <span className="text-xs text-blue-200 mt-1">сундук останется для двоих</span>
                        </button>

                        <button
                            onClick={() => onCollect('private')}
                            disabled={isProcessing}
                            className={`bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-2xl mb-1">💰</span>
                            <span>{isProcessing ? 'Сбор...' : 'Собрать и не делиться'}</span>
                            <span className="text-xs text-amber-200 mt-1">сундук сразу исчезнет</span>
                        </button>
                    </div>
                )}

                {isSharedByOther && !claimedByMe && !isDepleted && (
                    <button
                        onClick={() => onCollect('share')}
                        disabled={isProcessing}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <CompassIcon className="w-7 h-7 mb-1" />
                        <span>{isProcessing ? 'Сбор...' : `Собрать (осталось ${slotsLeft})`}</span>
                    </button>
                )}

                {errorText && (
                    <p className="text-red-400 text-sm mt-4 text-center">{errorText}</p>
                )}
            </div>
        </div>
    );
};

export const SelectedChestModal = React.memo(SelectedChestModalComponent);
