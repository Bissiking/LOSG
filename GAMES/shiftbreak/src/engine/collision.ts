// GAMES/shiftbreak/src/engine/collision.ts
import type { Rect } from './types';
export interface Hit { time: number; nx: number; ny: number }
export const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/** Swept AABB in relative coordinates, including moving obstacles. Touching while moving away is safe. */
export function sweep(a: Rect, dx: number, dy: number, b: Rect): Hit | null {
  if (overlaps(a, b)) return { time: 0, nx: 0, ny: 0 };
  const axis = (min: number, size: number, target: number, targetSize: number, delta: number): [number, number] => {
    if (delta === 0) return min < target + targetSize && min + size > target
      ? [-Infinity, Infinity] : [Infinity, -Infinity];
    const first = (target - min - size) / delta;
    const last = (target + targetSize - min) / delta;
    return [Math.min(first, last), Math.max(first, last)];
  };
  const [xe, xx] = axis(a.x, a.w, b.x, b.w, dx);
  const [ye, yx] = axis(a.y, a.h, b.y, b.h, dy);
  const enter = Math.max(xe, ye), exit = Math.min(xx, yx);
  if (enter > exit || enter < 0 || enter > 1 || exit <= 0) return null;
  return xe > ye ? { time: enter, nx: dx > 0 ? -1 : 1, ny: 0 }
    : { time: enter, nx: 0, ny: dy > 0 ? -1 : 1 };
}
