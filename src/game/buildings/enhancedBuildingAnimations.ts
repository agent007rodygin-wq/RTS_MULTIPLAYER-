export interface BuildingAnimSpec {
    working: string[];
    idle: string[];
    fps: number;
}

const buildFrameMap = (
    folder: string,
    specs: Array<{ ids: number[]; workingFrames: number; idleFrames: number; fps: number }>
): Record<number, BuildingAnimSpec> => {
    const map: Record<number, BuildingAnimSpec> = {};
    for (const spec of specs) {
        for (const id of spec.ids) {
            map[id] = {
                working: Array.from({ length: spec.workingFrames }, (_, i) => `/animation/${folder}/${id}/working/${i + 1}.webp`),
                idle: Array.from({ length: spec.idleFrames }, (_, i) => `/animation/${folder}/${id}/idle/${i + 1}.webp`),
                fps: spec.fps,
            };
        }
    }
    return map;
};

// Gold Smelter (Золотоплавильный завод): IDs 266, 557..576 (level 21 = 576, formerly lvl_01)
export const GOLD_SMELTER_ANIMS = buildFrameMap('gold_smelter', [
    { ids: [266, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569], workingFrames: 35, idleFrames: 40, fps: 24 },
    { ids: [570, 571, 572, 573, 574, 575], workingFrames: 18, idleFrames: 20, fps: 12 },
    { ids: [576], workingFrames: 40, idleFrames: 1, fps: 12 },
]);

// Steel Smelting Mill (Сталеплавильный завод): IDs 262, 475..486
export const STEEL_SMELTING_ANIMS = buildFrameMap('steel_smelting', [
    { ids: [262, 475, 476, 477, 478, 479, 480, 481, 482, 483], workingFrames: 36, idleFrames: 40, fps: 24 },
    { ids: [484, 485, 486], workingFrames: 18, idleFrames: 20, fps: 12 },
]);

// Enhanced Mushroom Bed (Улучшеная Грибная Грядка): IDs 874..894
export const MUSHROOM_BED_ANIMS = buildFrameMap('mushroom_bed', [
    { ids: [874, 875, 876, 877, 878], workingFrames: 40, idleFrames: 40, fps: 24 },
    { ids: [879, 880, 881, 882, 883], workingFrames: 20, idleFrames: 20, fps: 12 },
    { ids: [884, 885, 886, 887, 888], workingFrames: 19, idleFrames: 21, fps: 12 },
    { ids: [889, 890, 891, 892, 893, 894], workingFrames: 20, idleFrames: 20, fps: 12 },
]);

// Enhanced Pumpkin Bed (Улучшеная тыквенная грядка): IDs 911..931
export const PUMPKIN_BED_ANIMS = buildFrameMap('pumpkin_bed', [
    { ids: [911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930], workingFrames: 26, idleFrames: 39, fps: 24 },
    { ids: [931], workingFrames: 13, idleFrames: 20, fps: 12 },
]);

export const PUMPKIN_BED_ALL_IDS = Object.keys(PUMPKIN_BED_ANIMS).map(Number);
export const PUMPKIN_BED_ID_SET = new Set(PUMPKIN_BED_ALL_IDS);

// Construction cloud overlay (46 frames, 8 FPS from build_cloud.json)
export const BUILD_CLOUD_ANIMATION_FRAMES: string[] = Array.from(
    { length: 46 },
    (_, i) => `/animation/nbuild_cloud/clean/${i + 1}.webp`
);
export const BUILD_CLOUD_FPS = 8;

// Animated coin indicator above trees & ready production (18 frames)
export const COIN_ANIMATION_FRAMES: string[] = Array.from(
    { length: 18 },
    (_, i) => `/animation/coin_animation/frames/coin_frame_${String(i + 1).padStart(2, '0')}.png`
);
export const COIN_ANIMATION_FPS = 18;
