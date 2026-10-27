/**
 * DrawContext — контракт между App.tsx (владелец состояния) и модулями отрисовки canvas.
 *
 * Создаётся ОДИН раз за кадр внутри draw() и передаётся в drawTerrain / drawEntities /
 * drawEffects / drawOverlays. Это позволяет вынести 1700+ строк рендера из монолита,
 * не поднимая React-состояние и не вызывая ре-рендеров.
 *
 * ВАЖНО: поля-ссылки (Ref) передаются как есть — модули читают .current напрямую.
 * Это сохраняет идентичное поведение hot path (никаких лишних замыканий).
 */

import type { RefObject } from 'react';
import type { Building, Clan, Item, PlacedBuilding, VisualEffect } from '../../../types';

export type DrawableEntity =
  | PlacedBuilding
  | { entityType: 'resource'; id: string; type: 'tree' | 'oil' | 'quarry'; x: number; y: number }
  | { entityType: 'chest'; id: string; x: number; y: number };

export interface TileCoord {
  x: number;
  y: number;
}

export interface PlacementPreviewState {
  valid: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  drawHeight: number;
  colorMid: string;
  colorEnd: string;
  glowColor: string;
  edgeClass: string;
}

export interface DrawContext {
  /* --- DOM / canvas --- */
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  canvasRef: RefObject<HTMLCanvasElement | null>;

  /* --- кэш изображений (C.1) --- */
  images: Record<string, HTMLImageElement>;
  loadedImageElementsRef: RefObject<Record<string, HTMLImageElement>>;
  lastRenderableImageByEntityRef: RefObject<Map<string, HTMLImageElement>>;

  /* --- камера / зум --- */
  cameraOffsetRef: RefObject<{ x: number; y: number }>;
  zoomIndex: number;
  zoom: number;
  scaledTileWidth: number;
  scaledTileHeight: number;
  renderCenterX: number;
  renderCenterY: number;
  isWorldWrapped: boolean;
  worldToScreen: (worldX: number, worldY: number, zoomLevel: number) => { screenX: number; screenY: number };

  /* --- данные мира --- */
  allUsers: Record<string, any>;
  itemData: Item[];
  buildingData: Building[];
  placedBuildings: PlacedBuilding[];
  visualEffects: VisualEffect[];
  drawableEntities: DrawableEntity[];
  hoveredTile: TileCoord | null;
  clansRef: RefObject<Clan[]>;

  /* --- монстры: hot-path ссылки (C.3) --- */
  monsterLastActionRef?: RefObject<Map<string, number>>;
  monsterDirectionRef?: RefObject<Map<string, any>>;
  monsterAttackTimeRef?: RefObject<Map<string, number>>;
  monsterAttackDirectionRef?: RefObject<Map<string, any>>;
  monsterAttackCancelTimeRef?: RefObject<Map<string, number>>;
  monsterIdleDelayRef?: RefObject<Map<string, number>>;

  /* --- тайминги кадра --- */
  now: number;

  /* --- утилиты, передаваемые из App --- */
  getPlaybackDurationMs?: (frameCount: number, fps: number, multiplier?: number) => number;
  getPlaybackFrameIndex?: (elapsedMs: number, frameCount: number, fps: number, multiplier?: number) => number;
  normalizeClanIdValue?: (value: unknown) => number | null;
  getPlacementPreviewState?: (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    zoomLevel: number,
    isValid: boolean,
  ) => PlacementPreviewState;
  isZoneReadyForPlacement?: (zoneX: number, zoneY: number) => boolean;
  hasTownHall: boolean;
  townHallLocation: { x: number; y: number } | null;
  lastPointerPos: { x: number; y: number } | null;
  moveMode: any;
  hoveredOutOfBounds: boolean;

  /* --- startup диагностика (C.3) --- */
  startupFirstDrawLoggedRef: RefObject<boolean>;
  logStartupStep: (message: string, extra?: Record<string, unknown>) => void;
}
