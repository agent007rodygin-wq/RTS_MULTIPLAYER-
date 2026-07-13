export const BRONEKUR_WALK_BASE = '/animation/monsters/bronecur/DefineSprite_962_anim.a70006/ходьба';
export const IZBUSHKA_BASE = '/animation/monsters/Избушка/DefineSprite_1084_anim.a70001';
export const SANTA_BASE = '/animation/monsters/злой санта/DefineSprite_612_anim.a70002';
export const GORYNYCH_BASE = '/animation/monsters/горыныч/DefineSprite_1516_anim.a70003_base';
export const KOLOBOK_BASE = '/animation/monsters/колобок/DefineSprite_653_anim.a70004_base';
export const BABA_YAGA_BASE = '/animation/monsters/баба яга/DefineSprite_1181_anim.a70005';

export const bronekurWalkBottomFrames: string[] = [
  `${BRONEKUR_WALK_BASE}/ходьба с низу на топ/50_BOTTOM_LEFT.webp`,
  ...Array.from({ length: 70 }, (_, i) => `${BRONEKUR_WALK_BASE}/ходьба с низу на топ/${51 + i}.webp`),
  `${BRONEKUR_WALK_BASE}/ходьба с низу на топ/121_TOP.webp`
];
export const bronekurWalkTopRightFrames: string[] = [
  `${BRONEKUR_WALK_BASE}/с верхнего правого угла на топ/1_TOPRIGHR.webp`,
  ...Array.from({ length: 47 }, (_, i) => `${BRONEKUR_WALK_BASE}/с верхнего правого угла на топ/${2 + i}.webp`),
  `${BRONEKUR_WALK_BASE}/с верхнего правого угла на топ/49_TOP.webp`
];
export const bronekurWalkLeftTopFrames: string[] = [
  `${BRONEKUR_WALK_BASE}/с левого угла верхнего  двигаеться на топ/122_LEFT.webp`,
  ...Array.from({ length: 64 }, (_, i) => `${BRONEKUR_WALK_BASE}/с левого угла верхнего  двигаеться на топ/${123 + i}.webp`),
  `${BRONEKUR_WALK_BASE}/с левого угла верхнего  двигаеться на топ/187_TOP.webp`
];
export const bronekurWalkBottomRightFrames: string[] = [
  `${BRONEKUR_WALK_BASE}/с правого угла нижнего на топ/188_RIGHT_BOTTTOM.webp`,
  ...Array.from({ length: 62 }, (_, i) => `${BRONEKUR_WALK_BASE}/с правого угла нижнего на топ/${189 + i}.webp`),
  `${BRONEKUR_WALK_BASE}/с правого угла нижнего на топ/251_TOP.webp`
];
export const bronekurIdleFrames: string[] = Array.from({ length: 57 }, (_, i) => `/animation/monsters/bronecur/DefineSprite_962_anim.a70006/стоит/${424 + i}.webp`);
export const bronekurAttackTopFrames: string[] = Array.from({ length: 51 }, (_, i) => `/animation/monsters/bronecur/DefineSprite_962_anim.a70006/атака/удар в верхний квадрат/${374 + i}.webp`);
export const bronekurAttackLeftFrames: string[] = Array.from({ length: 34 }, (_, i) => `/animation/monsters/bronecur/DefineSprite_962_anim.a70006/атака/удар в левый квадрат/${290 + i}.webp`);
export const bronekurAttackBottomFrames: string[] = Array.from({ length: 40 }, (_, i) => `/animation/monsters/bronecur/DefineSprite_962_anim.a70006/атака/удар в нижний квадрат/${251 + i}.webp`);
export const bronekurAttackRightFrames: string[] = Array.from({ length: 52 }, (_, i) => `/animation/monsters/bronecur/DefineSprite_962_anim.a70006/атака/удар в правый квадрат/${323 + i}.webp`);

export const izbushkaWalkLeftFrames: string[] = Array.from({ length: 75 }, (_, i) => `${IZBUSHKA_BASE}/ходьба/идет на лево/${18 + i}.webp`);
export const izbushkaWalkRightFrames: string[] = Array.from({ length: 72 }, (_, i) => `${IZBUSHKA_BASE}/ходьба/идет на право/${137 + i}.webp`);
export const izbushkaWalkDownFrames: string[] = Array.from({ length: 74 }, (_, i) => `${IZBUSHKA_BASE}/ходьба/с верху идет в низ/${324 + i}.webp`);
export const izbushkaWalkUpFrames: string[] = Array.from({ length: 84 }, (_, i) => `${IZBUSHKA_BASE}/ходьба/с низу идет в верх/${224 + i}.webp`);
export const izbushkaIdleFrames: string[] = Array.from({ length: 31 }, (_, i) => `${IZBUSHKA_BASE}/стоит/${92 + i}.webp`);
export const izbushkaAttackTopFrames: string[] = Array.from({ length: 46 }, (_, i) => `${IZBUSHKA_BASE}/атвка/выстрел в верх/${491 + i}.webp`);
export const izbushkaAttackLeftFrames: string[] = Array.from({ length: 47 }, (_, i) => `${IZBUSHKA_BASE}/атвка/выстрел в лево/${398 + i}.webp`);
export const izbushkaAttackBottomFrames: string[] = Array.from({ length: 45 }, (_, i) => `${IZBUSHKA_BASE}/атвка/выстрел в низ/${537 + i}.webp`);
export const izbushkaAttackRightFrames: string[] = Array.from({ length: 46 }, (_, i) => `${IZBUSHKA_BASE}/атвка/выстрел в право/${445 + i}.webp`);
export const izbushkaCancelTopFrames: string[] = Array.from({ length: 16 }, (_, i) => `${IZBUSHKA_BASE}/отмена атаки/верхняя отмена атаки/${308 + i}.webp`);
export const izbushkaCancelLeftFrames: string[] = Array.from({ length: 15 }, (_, i) => `${IZBUSHKA_BASE}/отмена атаки/левая отмена атаки/${123 + i}.webp`);
export const izbushkaCancelBottomFrames: string[] = Array.from({ length: 16 }, (_, i) => `${IZBUSHKA_BASE}/отмена атаки/нижняя отмена атаки/${209 + i}.webp`);
export const izbushkaCancelRightFrames: string[] = [
  `${IZBUSHKA_BASE}/отмена атаки/правая отмена атаки/2_leftunattak.webp`,
  ...Array.from({ length: 15 }, (_, i) => `${IZBUSHKA_BASE}/отмена атаки/правая отмена атаки/${3 + i}.webp`)
];

export const santaWalkLeftFrames: string[] = Array.from({ length: 33 }, (_, i) => `${SANTA_BASE}/идет в лево/${190 + i}.webp`);
export const santaWalkDownFrames: string[] = Array.from({ length: 36 }, (_, i) => `${SANTA_BASE}/идет в низ/${154 + i}.webp`);
export const santaWalkRightFrames: string[] = Array.from({ length: 45 }, (_, i) => `${SANTA_BASE}/идет в право/${223 + i}.webp`);
export const santaWalkUpFrames: string[] = Array.from({ length: 41 }, (_, i) => `${SANTA_BASE}/идет на верх/${268 + i}.webp`);
export const santaAttackLeftFrames: string[] = Array.from({ length: 37 }, (_, i) => `${SANTA_BASE}/атака/выстрел в лево/${38 + i}.webp`);
export const santaAttackBottomFrames: string[] = Array.from({ length: 37 }, (_, i) => `${SANTA_BASE}/атака/выстрел в низ/${1 + i}.webp`);
export const santaAttackRightFrames: string[] = Array.from({ length: 42 }, (_, i) => `${SANTA_BASE}/атака/выстрел в право/${74 + i}.webp`);
export const santaAttackTopFrames: string[] = Array.from({ length: 40 }, (_, i) => `${SANTA_BASE}/атака/выстрел вверх/${115 + i}.webp`);

export const gorynychWalkUpFrames: string[] = Array.from({ length: 113 }, (_, i) => `${GORYNYCH_BASE}/анимация ходьбы по клеткам/идет в верх/${568 + i}.webp`);
export const gorynychWalkDownFrames: string[] = Array.from({ length: 58 }, (_, i) => `${GORYNYCH_BASE}/анимация ходьбы по клеткам/идет в низ/${338 + i}.webp`);
export const gorynychWalkLeftFrames: string[] = Array.from({ length: 70 }, (_, i) => `${GORYNYCH_BASE}/анимация ходьбы по клеткам/идет в лево/${498 + i}.webp`);
export const gorynychWalkRightFrames: string[] = Array.from({ length: 102 }, (_, i) => `${GORYNYCH_BASE}/анимация ходьбы по клеткам/идет в право/${396 + i}.webp`);
export const gorynychIdleFrames: string[] = Array.from({ length: 31 }, (_, i) => `${GORYNYCH_BASE}/анимация когда стоит на месте/${307 + i}.webp`);
export const gorynychAttackTopFrames: string[] = Array.from({ length: 107 }, (_, i) => `${GORYNYCH_BASE}/анимация когда атакует/удар в верх/${201 + i}.webp`);
export const gorynychAttackBottomFrames: string[] = Array.from({ length: 69 }, (_, i) => `${GORYNYCH_BASE}/анимация когда атакует/удар в низ/${1 + i}.webp`);
export const gorynychAttackLeftFrames: string[] = Array.from({ length: 71 }, (_, i) => `${GORYNYCH_BASE}/анимация когда атакует/удар в лево/${131 + i}.webp`);
export const gorynychAttackRightFrames: string[] = Array.from({ length: 63 }, (_, i) => `${GORYNYCH_BASE}/анимация когда атакует/удар в право/${69 + i}.webp`);

export const kolobokWalkUpFrames: string[] = Array.from({ length: 31 }, (_, i) => `${KOLOBOK_BASE}/анимация ходьбы/идет в верх/${296 + i}.webp`);
export const kolobokWalkDownFrames: string[] = Array.from({ length: 31 }, (_, i) => `${KOLOBOK_BASE}/анимация ходьбы/идет в низ/${203 + i}.webp`);
export const kolobokWalkLeftFrames: string[] = Array.from({ length: 31 }, (_, i) => `${KOLOBOK_BASE}/анимация ходьбы/идет в лево/${234 + i}.webp`);
export const kolobokWalkRightFrames: string[] = Array.from({ length: 31 }, (_, i) => `${KOLOBOK_BASE}/анимация ходьбы/идет в право/${265 + i}.webp`);
export const kolobokIdleFrames: string[] = Array.from({ length: 25 }, (_, i) => `${KOLOBOK_BASE}/анимация когда стоит на месте/${178 + i}.webp`);
export const kolobokAttackTopFrames: string[] = Array.from({ length: 52 }, (_, i) => `${KOLOBOK_BASE}/атака/атака в верх/${127 + i}.webp`);
export const kolobokAttackLeftFrames: string[] = Array.from({ length: 43 }, (_, i) => `${KOLOBOK_BASE}/атака/атака в лево/${85 + i}.webp`);
export const kolobokAttackBottomFrames: string[] = Array.from({ length: 43 }, (_, i) => `${KOLOBOK_BASE}/атака/атака в низ/${1 + i}.webp`);
export const kolobokAttackRightFrames: string[] = [
  ...Array.from({ length: 42 }, (_, i) => `${KOLOBOK_BASE}/атака/атака в право/${43 + i}.webp`),
  `${KOLOBOK_BASE}/атака/атака в право/84.2.webp`
];

export const babaYagaWalkUpFrames: string[] = Array.from({ length: 56 }, (_, i) => `${BABA_YAGA_BASE}/анимация ходьбы монстра/идет вверх/${472 + i}.webp`);
export const babaYagaWalkDownFrames: string[] = Array.from({ length: 61 }, (_, i) => `${BABA_YAGA_BASE}/анимация ходьбы монстра/идет в низ/${412 + i}.webp`);
export const babaYagaWalkLeftFrames: string[] = Array.from({ length: 62 }, (_, i) => `${BABA_YAGA_BASE}/анимация ходьбы монстра/идет на лево/${350 + i}.webp`);
export const babaYagaWalkRightFrames: string[] = Array.from({ length: 63 }, (_, i) => `${BABA_YAGA_BASE}/анимация ходьбы монстра/идет на право/${528 + i}.webp`);
export const babaYagaIdleFrames: string[] = Array.from({ length: 93 }, (_, i) => `${BABA_YAGA_BASE}/анимация когда мнстр стоит/${1 + i}.webp`);
export const babaYagaAttackTopFrames: string[] = Array.from({ length: 66 }, (_, i) => `${BABA_YAGA_BASE}/анимация атаки монстра/атака верх/${204 + i}.webp`);
export const babaYagaAttackLeftFrames: string[] = Array.from({ length: 81 }, (_, i) => `${BABA_YAGA_BASE}/анимация атаки монстра/левая атака атакует левую клетку/${269 + i}.webp`);
export const babaYagaAttackBottomFrames: string[] = Array.from({ length: 49 }, (_, i) => `${BABA_YAGA_BASE}/анимация атаки монстра/нижняя атака/${91 + i}.webp`);
export const babaYagaAttackRightFrames: string[] = Array.from({ length: 66 }, (_, i) => `${BABA_YAGA_BASE}/анимация атаки монстра/правая атака/${139 + i}.webp`);
