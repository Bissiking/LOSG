// src/game/LevelStore.ts
import { level01, type LevelData, type PlatformData, type TerrainPoint } from '../levels/level01';

const STORAGE_KEY = 'dustbound.level.level-01';

const cloneLevel = (level: LevelData): LevelData => structuredClone(level);

export function getActiveLevel(): LevelData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return cloneLevel(level01);
  try {
    const normalized = normalizeLevel(JSON.parse(stored));
    if (hasLegacyPlatformLayout(normalized)) {
      localStorage.removeItem(STORAGE_KEY);
      return cloneLevel(level01);
    }
    return normalized;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return cloneLevel(level01);
  }
}

export function saveActiveLevel(level: LevelData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeLevel(level)));
}

export function resetActiveLevel(): LevelData {
  localStorage.removeItem(STORAGE_KEY);
  return cloneLevel(level01);
}

export function normalizeLevel(value: unknown): LevelData {
  if (!isRecord(value)) throw new Error('Le fichier ne contient pas un niveau valide.');
  const terrainValue = value.terrain;
  const platformsValue = value.platforms;
  if (!Array.isArray(terrainValue) || terrainValue.length < 2) throw new Error('Le terrain doit contenir au moins deux points.');
  if (!Array.isArray(platformsValue)) throw new Error('La liste des plateformes est invalide.');

  const terrain = terrainValue.map((point, index) => normalizePoint(point, `terrain[${index}]`)).sort((a, b) => a.x - b.x);
  const platforms = platformsValue.map((platform, index) => normalizePlatform(platform, index));
  const start = normalizePoint(value.start, 'start');
  const finish = normalizePoint(value.finish, 'finish');
  const width = finiteNumber(value.width, 'width');
  if (width < terrain.at(-1)!.x || finish.x > width) throw new Error('La largeur doit inclure le terrain et la ligne d’arrivée.');

  return {
    id: typeof value.id === 'string' ? value.id : 'level-01',
    name: typeof value.name === 'string' ? value.name : 'Niveau sans titre',
    width,
    start,
    finish,
    terrain,
    platforms,
  };
}

function normalizePoint(value: unknown, label: string): TerrainPoint {
  if (!isRecord(value)) throw new Error(`${label} est invalide.`);
  return { x: finiteNumber(value.x, `${label}.x`), y: finiteNumber(value.y, `${label}.y`) };
}

function normalizePlatform(value: unknown, index: number): PlatformData {
  if (!isRecord(value)) throw new Error(`platforms[${index}] est invalide.`);
  return {
    id: typeof value.id === 'string' ? value.id : `platform-${crypto.randomUUID()}`,
    x: finiteNumber(value.x, `platforms[${index}].x`),
    y: finiteNumber(value.y, `platforms[${index}].y`),
    width: PhaserClamp(finiteNumber(value.width, `platforms[${index}].width`), 80, 800),
    angle: PhaserClamp(typeof value.angle === 'number' ? value.angle : 0, -0.8, 0.8),
  };
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} doit être un nombre.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasLegacyPlatformLayout(level: LevelData): boolean {
  const legacy = [
    [2540, 430], [2850, 350], [4820, 450], [5200, 390],
    [6120, 460], [8850, 430], [9220, 390], [10120, 430],
  ];
  return level.platforms.length === legacy.length && level.platforms.every((platform, index) => (
    platform.x === legacy[index][0] && platform.y === legacy[index][1]
  ));
}

function PhaserClamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
