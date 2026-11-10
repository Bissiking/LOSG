// GAMES/shiftbreak/src/engine/player.ts
import type { Level, PhysicsConfig, Player, World } from './types';
export const PHYSICS: Readonly<PhysicsConfig> = Object.freeze({
  step: 1 / 120, acceleration: 1900, maxVerticalSpeed: 680, flipSpeed: 170,
  initialSpeed: 240, horizontalAcceleration: 2.4, maxSpeed: 360,
});
export function createPlayer(level: Level): Player {
  return { ...level.spawn, w: 24, h: 24, vy: 0, gravity: 1, grounded: true };
}
export function createWorld(level: Level, deaths = 0): World {
  return { player: createPlayer(level), phase: 'playing', time: 0, speed: PHYSICS.initialSpeed,
    deaths, flips: 0, collapsed: new Map(), deathReason: '' };
}
/** Reversing momentum immediately gives the same responsive launch on a rail and in the air. */
export function flipGravity(world: World, config: PhysicsConfig = PHYSICS): void {
  if (world.phase !== 'playing') return;
  const p = world.player;
  p.gravity = p.gravity === 1 ? -1 : 1;
  p.vy = p.gravity * Math.max(config.flipSpeed, Math.abs(p.vy));
  p.grounded = false;
  world.flips++;
}
