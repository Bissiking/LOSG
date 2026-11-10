// GAMES/shiftbreak/src/engine/physics.ts
import { overlaps, sweep } from './collision';
import { activeIntervals, hazardRect } from './obstacles';
import { PHYSICS } from './player';
import type { Level, PhysicsConfig, Rect, World } from './types';

function die(world: World, reason: string): void {
  world.phase = 'dead'; world.deaths++; world.deathReason = reason;
}
interface Segment { from: Rect; dx: number; dy: number; start: number; end: number }
/** Pure fixed-step simulation: no clock, browser, renderer, random input or storage. */
export function stepWorld(world: World, level: Level, config: PhysicsConfig = PHYSICS): void {
  if (world.phase !== 'playing') return;
  const dt = config.step, p = world.player, start = world.time;
  world.time += dt;
  const nextSpeed = Math.min(config.maxSpeed, world.speed + config.horizontalAcceleration * dt);
  let dx = (world.speed + nextSpeed) * 0.5 * dt;
  world.speed = nextSpeed;
  p.vy = Math.max(-config.maxVerticalSpeed, Math.min(config.maxVerticalSpeed, p.vy + p.gravity * config.acceleration * dt));
  let dy = p.vy * dt, fraction = 0;
  p.grounded = false;
  const path: Segment[] = [];
  // First the airborne sweep, then the horizontal remainder after landing.
  // The second sweep is essential: a floor contact at t=0 must not hide a wall later in the step.
  for (let pass = 0; pass < 2; pass++) {
    let contact: typeof level.platforms[number] | undefined;
    let hitTime = 2, normal = 0, side = false;
    for (const platform of level.platforms) {
      if (platform.x > p.x + p.w + dx || platform.x + platform.w < p.x) continue;
      const touched = world.collapsed.get(platform.id);
      if (platform.temporary !== undefined && touched !== undefined && world.time - touched >= platform.temporary) continue;
      const hit = sweep(p, dx, dy, platform);
      if (hit && hit.time < hitTime) {
        hitTime = hit.time; normal = hit.ny; side = hit.nx !== 0 || hit.ny === 0; contact = platform;
      }
    }
    if (!contact) {
      path.push({ from: { ...p }, dx, dy, start: fraction, end: 1 });
      p.x += dx; p.y += dy;
      break;
    }
    const until = fraction + (1 - fraction) * hitTime;
    path.push({ from: { ...p }, dx: dx * hitTime, dy: dy * hitTime, start: fraction, end: until });
    p.x += dx * hitTime; p.y += dy * hitTime;
    if (side) { die(world, 'Bord de plateforme'); return; }
    p.y = normal === -1 ? contact.y - p.h : contact.y + contact.h;
    p.grounded = true; p.vy = 0;
    if (contact.temporary !== undefined && !world.collapsed.has(contact.id)) world.collapsed.set(contact.id, world.time);
    fraction = until; dx *= 1 - hitTime; dy = 0;
  }
  for (const hazard of level.hazards) {
    if (hazard.x > p.x + p.w || hazard.x + hazard.w < path[0].from.x) continue;
    for (const segment of path) {
      const begin = start + segment.start * dt, end = start + segment.end * dt;
      for (const interval of activeIntervals(hazard, begin, end)) {
        const duration = end - begin;
        const from = duration > 0 ? (interval.start - begin) / duration : 0;
        const portion = duration > 0 ? (interval.end - interval.start) / duration : 1;
        const position = { ...segment.from, x: segment.from.x + segment.dx * from, y: segment.from.y + segment.dy * from };
        const mx = segment.dx * portion, my = segment.dy * portion;
        const before = hazardRect(hazard, interval.start), after = hazardRect(hazard, interval.end);
        const hit = sweep(position, mx, my - (after.y - before.y), before);
        const destination = { ...position, x: position.x + mx, y: position.y + my };
        if (hit || overlaps(destination, after)) {
          if (hit) { p.x = position.x + mx * hit.time; p.y = position.y + my * hit.time; }
          die(world, hazard.kind === 'pulse' ? 'Barrière active' : hazard.kind === 'moving' ? 'Obstacle mobile' : 'Obstacle');
          return;
        }
      }
    }
  }
  if (p.y > level.height + 80 || p.y + p.h < -80) { die(world, 'Hors du parcours'); return; }
  if (p.x >= level.length) world.phase = 'won';
}
