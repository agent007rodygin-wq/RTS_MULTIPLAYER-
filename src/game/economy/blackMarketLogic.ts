import type { Item, ResourceInfo } from '../../../types';

export interface MissingResource {
    id: number;
    name: string;
    imageUrl: string;
    required: number;
    available: number;
    missing: number;
    rubyPackQuantity: number;
    rubiesNeeded: number;
    itemsToReceive: number;
}

/**
 * Calculates ruby cost for a given quantity of an item based on rubyPackQuantity.
 */
export function calculateResourceRubyCost(
    amount: number,
    rubyPackQuantity: number = 1
): { rubies: number; itemsReceived: number } {
    if (amount <= 0) {
        return { rubies: 0, itemsReceived: 0 };
    }
    const pack = Math.max(1, rubyPackQuantity);
    const rubies = Math.max(1, Math.ceil(amount / pack));
    const itemsReceived = rubies * pack;
    return { rubies, itemsReceived };
}

/**
 * Analyzes construction requirements against player inventory and returns detailed missing resources.
 */
export function calculateMissingResources(
    requirements: ResourceInfo[] | undefined,
    inventory: Record<number | string, number>,
    itemData: Item[]
): MissingResource[] {
    if (!requirements || requirements.length === 0) return [];

    const missingList: MissingResource[] = [];

    for (const req of requirements) {
        const requiredAmount = req.amount || 0;
        const available = Math.max(0, Number(inventory[req.id]) || 0);
        const missing = Math.max(0, requiredAmount - available);

        if (missing > 0) {
            const item = itemData.find(i => i.id === req.id);
            const rubyPackQuantity = Math.max(1, item?.rubyPackQuantity || 1);
            const cost = calculateResourceRubyCost(missing, rubyPackQuantity);

            missingList.push({
                id: req.id,
                name: item?.name || req.name || `Предмет #${req.id}`,
                imageUrl: item?.imageUrl || '/Gui/Front/значек монет/Image-2.webp',
                required: requiredAmount,
                available,
                missing,
                rubyPackQuantity,
                rubiesNeeded: cost.rubies,
                itemsToReceive: cost.itemsReceived
            });
        }
    }

    return missingList;
}

/**
 * Calculates total rubies needed to purchase all missing resources.
 */
export function calculateTotalRubiesNeeded(missingList: MissingResource[]): number {
    return missingList.reduce((sum, item) => sum + item.rubiesNeeded, 0);
}
