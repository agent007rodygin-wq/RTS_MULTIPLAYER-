const KOTOFEY_BASE = '/animation/monsters/Котофей';

export const KOTOFEY_FPS = 25;
export const KOTOFEY_SHADOW_CENTER_X = 203.5;
export const KOTOFEY_SHADOW_CENTER_Y = 269.0;
export const KOTOFEY_SPRITE_WIDTH = 446;
export const KOTOFEY_SPRITE_HEIGHT = 377;
// Aligns Flash 120x60 step with BaSingSe 256x128 (half-tile 128x64) grid
export const KOTOFEY_CANVAS_SCALE = 446 / 240;

export const kotofeyIdleFrames: string[] = Array.from(
  { length: 66 },
  (_, i) => `${KOTOFEY_BASE}/idle/${i}.webp`
);
export const kotofeyWalkBottomFrames: string[] = Array.from(
  { length: 50 },
  (_, i) => `${KOTOFEY_BASE}/walk_bottom/${i}.webp`
);
export const kotofeyWalkLeftFrames: string[] = Array.from(
  { length: 50 },
  (_, i) => `${KOTOFEY_BASE}/walk_left/${i}.webp`
);
export const kotofeyWalkRightFrames: string[] = Array.from(
  { length: 41 },
  (_, i) => `${KOTOFEY_BASE}/walk_right/${i}.webp`
);
export const kotofeyWalkTopFrames: string[] = Array.from(
  { length: 49 },
  (_, i) => `${KOTOFEY_BASE}/walk_top/${i}.webp`
);
export const kotofeyAttackBottomFrames: string[] = Array.from(
  { length: 30 },
  (_, i) => `${KOTOFEY_BASE}/attack_bottom/${i}.webp`
);
export const kotofeyAttackLeftFrames: string[] = Array.from(
  { length: 40 },
  (_, i) => `${KOTOFEY_BASE}/attack_left/${i}.webp`
);
export const kotofeyAttackRightFrames: string[] = Array.from(
  { length: 40 },
  (_, i) => `${KOTOFEY_BASE}/attack_right/${i}.webp`
);
export const kotofeyAttackTopFrames: string[] = Array.from(
  { length: 40 },
  (_, i) => `${KOTOFEY_BASE}/attack_top/${i}.webp`
);

export const kotofeyAllAnimationFrames: string[] = [
  ...kotofeyIdleFrames,
  ...kotofeyWalkBottomFrames,
  ...kotofeyWalkLeftFrames,
  ...kotofeyWalkRightFrames,
  ...kotofeyWalkTopFrames,
  ...kotofeyAttackBottomFrames,
  ...kotofeyAttackLeftFrames,
  ...kotofeyAttackRightFrames,
  ...kotofeyAttackTopFrames,
];
