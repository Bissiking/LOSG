// GAMES/shiftbreak/src/levels/demo.ts
import type { Hazard, Level, Platform } from '../engine/types';
// Authored coordinates, never procedural. Safe recovery space separates each lesson.
const platforms: Platform[] = [
  { id: 'ceiling', x: 0, y: 56, w: 23600, h: 24 },
  { id: 'floor-a', x: 0, y: 460, w: 11700, h: 24 },
  { id: 'floor-b', x: 13200, y: 460, w: 10400, h: 24 },
  { id: 'bridge-a', x: 11700, y: 460, w: 500, h: 24, temporary: 0.6 },
  { id: 'bridge-b', x: 12200, y: 460, w: 500, h: 24, temporary: 0.6 },
  { id: 'bridge-c', x: 12700, y: 460, w: 500, h: 24, temporary: 0.6 },
];
const spikes = (id: string, x: number, side: 'floor' | 'ceiling', w = 100, h = 116): Hazard =>
  ({ id, x, y: side === 'floor' ? 460 - h : 80, w, h, kind: 'spikes' });
const mobile = (id: string, x: number, phase: number): Hazard => ({
  id, x, y: 225, w: 48, h: 90, kind: 'moving', motion: { amplitude: 115, period: 4, phase },
});
const pulse = (id: string, x: number, top: boolean, phase: number): Hazard => ({
  id, x, y: top ? 80 : 288, w: 46, h: 172, kind: 'pulse',
  pulse: { period: 3, active: 1.5, phase, warning: 0.6 },
});
export const DEMO_LEVEL: Level = {
  name: 'La ligne de rupture', length: 23200, height: 540, spawn: { x: 160, y: 436 }, platforms,
  hazards: [
    spikes('learn-floor', 1750, 'floor'), spikes('learn-ceiling', 2850, 'ceiling'),
    spikes('static-a', 3800, 'floor', 150), spikes('static-b', 4720, 'ceiling', 150),
    spikes('static-c', 5640, 'floor', 190), spikes('static-d', 6600, 'ceiling', 170),
    mobile('shuttle-a', 7700, 0), spikes('mobile-floor', 8250, 'floor'),
    mobile('shuttle-b', 8880, 0.5), spikes('mobile-ceiling', 9500, 'ceiling'), mobile('shuttle-c', 10200, 0.25),
    spikes('bridge-entry', 11200, 'ceiling'), spikes('bridge-exit', 13800, 'floor', 140),
    pulse('sync-a', 15100, false, 0), pulse('sync-b', 15650, true, 0),
    pulse('sync-c', 16200, false, 1.5), pulse('sync-d', 16750, true, 1.5),
    spikes('final-a', 18100, 'floor', 140), mobile('final-shuttle', 18800, 0.5),
    spikes('final-b', 19500, 'ceiling', 140), pulse('final-gate', 20300, false, 0.75),
    spikes('final-c', 21300, 'floor', 160), spikes('final-d', 22100, 'ceiling', 130),
  ],
  sections: [
    { x: 0, name: 'Prendre le pli', hint: 'Une pression. La gravité change de sens.' },
    { x: 3400, name: 'Changer de ligne', hint: 'Anticipez les blocs hachurés : ils sont mortels.' },
    { x: 7200, name: 'Trouver la fenêtre', hint: 'Les navettes bougent. Gardez leur trajectoire en vue.' },
    { x: 10800, name: 'Ne pas s’attarder', hint: 'Les rails pointillés cèdent 0,6 s après le contact.' },
    { x: 14600, name: 'Lire le rythme', hint: 'Barrière pleine : danger. Pointillés : passage libre.' },
    { x: 17700, name: 'Tenir la ligne', hint: 'Dernière section. Combinez vos réflexes.' },
  ],
};
export function sectionAt(level: Level, x: number) {
  return level.sections.filter((section) => x >= section.x).at(-1) ?? level.sections[0];
}
