// GAMES/shiftbreak/src/engine/obstacles.ts
import type { Hazard, Rect } from './types';
export function hazardRect(hazard: Hazard, time: number): Rect {
  const y = hazard.y + (hazard.motion
    ? Math.sin((time / hazard.motion.period + hazard.motion.phase) * Math.PI * 2) * hazard.motion.amplitude : 0);
  return { x: hazard.x, y, w: hazard.w, h: hazard.h };
}
export function pulsePhase(hazard: Hazard, time: number): number {
  const p = hazard.pulse;
  return p ? ((time + p.phase) % p.period + p.period) % p.period : 0;
}
export function isActive(hazard: Hazard, time: number): boolean {
  return !hazard.pulse || pulsePhase(hazard, time) < hazard.pulse.active;
}
export function isWarning(hazard: Hazard, time: number): boolean {
  const p = hazard.pulse;
  return !!p && pulsePhase(hazard, time) >= p.period - p.warning;
}
/** Include activation anywhere in the step so a gate cannot be skipped at its time boundary. */
export function activeDuring(hazard: Hazard, start: number, end: number): boolean {
  if (!hazard.pulse || isActive(hazard, start) || isActive(hazard, end)) return true;
  const p = hazard.pulse;
  return Math.floor((start + p.phase) / p.period) !== Math.floor((end + p.phase) / p.period);
}
/** Clip motion to active windows: a gate activating after a crossing must not retroactively kill. */
export function activeIntervals(hazard: Hazard, start: number, end: number): { start: number; end: number }[] {
  if (!hazard.pulse) return [{ start, end }];
  const p = hazard.pulse, intervals: { start: number; end: number }[] = [];
  const first = Math.floor((start + p.phase) / p.period), last = Math.floor((end + p.phase) / p.period);
  for (let cycle = first; cycle <= last; cycle++) {
    const begin = Math.max(start, cycle * p.period - p.phase);
    const finish = Math.min(end, cycle * p.period - p.phase + p.active);
    if (begin <= finish && isActive(hazard, begin)) intervals.push({ start: begin, end: finish });
  }
  return intervals;
}
