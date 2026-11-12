import { TROLL_ID, AIBOLIT_ID, BIG_AIBOLIT_ID } from './monsterIds.js';

export interface CustomMonsterAnimationSpec {
  id: number;
  basePath: string;
  fps: number;
  shadowCenterX: number;
  shadowCenterY: number;
  spriteWidth: number;
  spriteHeight: number;
  canvasScale: number;
  idleFrames: string[];
  walkBottomFrames: string[];
  walkLeftFrames: string[];
  walkRightFrames: string[];
  walkTopFrames: string[];
  attackBottomFrames: string[];
  attackLeftFrames: string[];
  attackRightFrames: string[];
  attackTopFrames: string[];
  allAnimationFrames: string[];
}

function buildSequence(basePath: string, folder: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${basePath}/${folder}/${i}.webp`);
}

function createMonsterAnimationSpec(params: {
  id: number;
  basePath: string;
  fps: number;
  shadowCenterX: number;
  shadowCenterY: number;
  spriteWidth: number;
  spriteHeight: number;
  counts: {
    idle: number;
    walk_bottom: number;
    walk_left: number;
    walk_right: number;
    walk_top: number;
    attack_bottom: number;
    attack_left: number;
    attack_right: number;
    attack_top: number;
  };
}): CustomMonsterAnimationSpec {
  const { id, basePath, fps, shadowCenterX, shadowCenterY, spriteWidth, spriteHeight, counts } = params;
  const idleFrames = buildSequence(basePath, 'idle', counts.idle);
  const walkBottomFrames = buildSequence(basePath, 'walk_bottom', counts.walk_bottom);
  const walkLeftFrames = buildSequence(basePath, 'walk_left', counts.walk_left);
  const walkRightFrames = buildSequence(basePath, 'walk_right', counts.walk_right);
  const walkTopFrames = buildSequence(basePath, 'walk_top', counts.walk_top);
  const attackBottomFrames = buildSequence(basePath, 'attack_bottom', counts.attack_bottom);
  const attackLeftFrames = buildSequence(basePath, 'attack_left', counts.attack_left);
  const attackRightFrames = buildSequence(basePath, 'attack_right', counts.attack_right);
  const attackTopFrames = buildSequence(basePath, 'attack_top', counts.attack_top);

  return {
    id,
    basePath,
    fps,
    shadowCenterX,
    shadowCenterY,
    spriteWidth,
    spriteHeight,
    canvasScale: spriteWidth / 240,
    idleFrames,
    walkBottomFrames,
    walkLeftFrames,
    walkRightFrames,
    walkTopFrames,
    attackBottomFrames,
    attackLeftFrames,
    attackRightFrames,
    attackTopFrames,
    allAnimationFrames: [
      ...idleFrames,
      ...walkBottomFrames,
      ...walkLeftFrames,
      ...walkRightFrames,
      ...walkTopFrames,
      ...attackBottomFrames,
      ...attackLeftFrames,
      ...attackRightFrames,
      ...attackTopFrames,
    ],
  };
}

export const TROLL_ANIMATION_SPEC = createMonsterAnimationSpec({
  id: TROLL_ID,
  basePath: '/animation/monsters/троль',
  fps: 24,
  shadowCenterX: 257.7,
  shadowCenterY: 285.9,
  spriteWidth: 470,
  spriteHeight: 382,
  counts: {
    idle: 32,
    walk_bottom: 21,
    walk_left: 35,
    walk_right: 36,
    walk_top: 40,
    attack_bottom: 16,
    attack_left: 29,
    attack_right: 31,
    attack_top: 35,
  },
});

export const AIBOLIT_ANIMATION_SPEC = createMonsterAnimationSpec({
  id: AIBOLIT_ID,
  basePath: '/animation/monsters/Айболит',
  fps: 24,
  shadowCenterX: 171.9,
  shadowCenterY: 214.8,
  spriteWidth: 365,
  spriteHeight: 303,
  counts: {
    idle: 30,
    walk_bottom: 46,
    walk_left: 50,
    walk_right: 55,
    walk_top: 55,
    attack_bottom: 55,
    attack_left: 55,
    attack_right: 55,
    attack_top: 59,
  },
});

export const BIG_AIBOLIT_ANIMATION_SPEC = createMonsterAnimationSpec({
  id: BIG_AIBOLIT_ID,
  basePath: '/animation/monsters/Большой айболит',
  fps: 24,
  shadowCenterX: 169.5,
  shadowCenterY: 260.2,
  spriteWidth: 365,
  spriteHeight: 346,
  counts: {
    idle: 30,
    walk_bottom: 46,
    walk_left: 50,
    walk_right: 55,
    walk_top: 55,
    attack_bottom: 55,
    attack_left: 55,
    attack_right: 55,
    attack_top: 59,
  },
});

export const CUSTOM_MONSTER_ANIMATION_SPECS: Record<number, CustomMonsterAnimationSpec> = {
  [TROLL_ID]: TROLL_ANIMATION_SPEC,
  [AIBOLIT_ID]: AIBOLIT_ANIMATION_SPEC,
  [BIG_AIBOLIT_ID]: BIG_AIBOLIT_ANIMATION_SPEC,
};

export const trollAllAnimationFrames = TROLL_ANIMATION_SPEC.allAnimationFrames;
export const aibolitAllAnimationFrames = AIBOLIT_ANIMATION_SPEC.allAnimationFrames;
export const bigAibolitAllAnimationFrames = BIG_AIBOLIT_ANIMATION_SPEC.allAnimationFrames;
