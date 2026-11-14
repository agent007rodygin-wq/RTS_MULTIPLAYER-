// Generated from gnomograd.com client assets /game/assets/anim/<id>.json|.webp
// (see scripts/extract_town_hall_animations.py). Frames live in
// public/animation/town_hall/<id>/<n>.webp; each frame canvas is wider than the
// static building image to make room for the waving flag / moving dragons.
// offsetX/offsetY position the static image inside the frame canvas so the
// animation can be drawn as an overlay aligned with the static base.

export interface TownHallAnimSpec {
    frames: string[];
    fps: number;
    frameWidth: number;
    frameHeight: number;
    staticWidth: number;
    staticHeight: number;
    offsetX: number;
    offsetY: number;
}

const buildTownHallAnim = (id: number, frameCount: number, fps: number, frameWidth: number, frameHeight: number, staticWidth: number, staticHeight: number, offsetX: number, offsetY: number): TownHallAnimSpec => ({
    frames: Array.from({ length: frameCount }, (_, i) => `/animation/town_hall/${id}/${i + 1}.webp`),
    fps,
    frameWidth,
    frameHeight,
    staticWidth,
    staticHeight,
    offsetX,
    offsetY,
});

// Town Hall (Городской центр) levels: id -> animation spec
export const TOWN_HALL_ANIMS: Record<number, TownHallAnimSpec> = {
    301: buildTownHallAnim(301, 61, 24.0, 221, 252, 161, 252, 0, 0),
    306: buildTownHallAnim(306, 61, 24.0, 221, 287, 161, 287, 0, 0),
    312: buildTownHallAnim(312, 31, 12.0, 229, 306, 168, 306, 0, 0),
    331: buildTownHallAnim(331, 31, 12.0, 232, 385, 176, 385, 0, 0),
    345: buildTownHallAnim(345, 31, 12.0, 258, 382, 196, 382, 0, 0),
    346: buildTownHallAnim(346, 31, 12.0, 261, 383, 199, 383, 0, 0),
    347: buildTownHallAnim(347, 61, 24.0, 262, 435, 200, 435, 0, 0),
    348: buildTownHallAnim(348, 61, 24.0, 262, 441, 225, 441, 0, 0),
    349: buildTownHallAnim(349, 61, 24.0, 262, 446, 212, 446, 0, 0),
    350: buildTownHallAnim(350, 61, 24.0, 262, 447, 222, 447, 0, 0),
    351: buildTownHallAnim(351, 61, 24.0, 275, 456, 236, 456, 0, 0),
    352: buildTownHallAnim(352, 61, 24.0, 304, 471, 268, 471, 0, 0),
    353: buildTownHallAnim(353, 61, 24.0, 303, 511, 267, 511, 0, 0),
    354: buildTownHallAnim(354, 61, 24.0, 303, 517, 268, 517, 0, 0),
    355: buildTownHallAnim(355, 61, 24.0, 312, 570, 272, 570, 0, 0),
    360: buildTownHallAnim(360, 61, 24.0, 317, 570, 277, 570, 0, 0),
    361: buildTownHallAnim(361, 61, 24.0, 317, 607, 277, 607, 0, 0),
    371: buildTownHallAnim(371, 61, 24.0, 317, 682, 277, 682, 0, 0),
    381: buildTownHallAnim(381, 9, 3.43, 343, 754, 304, 754, 0, 0),
    413: buildTownHallAnim(413, 9, 3.43, 357, 754, 318, 754, 0, 0),
    414: buildTownHallAnim(414, 9, 3.43, 357, 849, 318, 849, 0, 0),
    452: buildTownHallAnim(452, 9, 3.43, 357, 849, 328, 849, 0, 0),
    726: buildTownHallAnim(726, 10, 8.0, 366, 998, 366, 996, 0, 2),
    752: buildTownHallAnim(752, 5, 1.85, 405, 1100, 366, 1025, 8, 18),
};
