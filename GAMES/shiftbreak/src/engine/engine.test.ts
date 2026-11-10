// GAMES/shiftbreak/src/engine/engine.test.ts
import { describe, expect, it } from 'vitest';
import { sweep } from './collision';
import { FixedClock } from './clock';
import { activeDuring, hazardRect, isActive, isWarning } from './obstacles';
import { PHYSICS, createWorld, flipGravity } from './player';
import { stepWorld } from './physics';
import { DEMO_LEVEL } from '../levels/demo';
import type { Hazard, Level, World } from './types';
import { REFERENCE_FLIPS } from '../levels/reference';

const box = { x: 0, y: 0, w: 24, h: 24 };
const level = (): Level => ({ name: 'fixture', length: 100000, height: 540, spawn: { x: 160, y: 436 },
  sections: [], hazards: [], platforms: [{ id: 'floor', x: 0, y: 460, w: 100000, h: 24 },
    { id: 'ceiling', x: 0, y: 56, w: 100000, h: 24 }] });
const run = (world: World, map: Level, ticks: number) => { for (let i = 0; i < ticks; i++) stepWorld(world, map); };

describe('continuous collision', () => {
  it('detects a thin obstacle crossed entirely in one tick', () => {
    expect(sweep(box, 1000, 0, { x: 500, y: 0, w: 1, h: 24 })).toEqual({ time: 0.476, nx: -1, ny: 0 });
  });
  it('allows tangency, touching while leaving and stationary separated axes', () => {
    expect(sweep(box, 0, -30, { x: 0, y: 24, w: 24, h: 4 })).toBeNull();
    expect(sweep(box, 80, 0, { x: 40, y: 24, w: 24, h: 24 })).toBeNull();
    expect(sweep(box, 0, 80, { x: 40, y: 40, w: 24, h: 24 })).toBeNull();
  });
  it('detects starting overlap and ceiling contacts', () => {
    expect(sweep(box, 10, 10, { x: 10, y: 10, w: 10, h: 10 })?.time).toBe(0);
    expect(sweep({ ...box, y: 100 }, 0, -200, { x: 0, y: 0, w: 100, h: 4 })).toEqual({ time: 0.48, nx: 0, ny: 1 });
  });
});

describe('fixed-step player and platforms', () => {
  it('reverses momentum immediately and supports unlimited successive flips', () => {
    const w = createWorld(level()); w.player.vy = 500;
    flipGravity(w); expect(w.player.vy).toBe(-500); expect(w.player.gravity).toBe(-1);
    for (let i = 0; i < 1001; i++) flipGravity(w);
    expect(w.player.gravity).toBe(1); expect(w.player.vy).toBe(500); expect(w.flips).toBe(1002);
  });
  it('leaves a rail, lands on the ceiling and cannot penetrate either rail', () => {
    const map = level(), w = createWorld(map); flipGravity(w); run(w, map, 120);
    expect(w.player.y).toBe(80); expect(w.player.grounded).toBe(true); expect(w.player.vy).toBe(0);
    flipGravity(w); run(w, map, 120);
    expect(w.player.y).toBe(436); expect(w.phase).toBe('playing');
  });
  it('lands at high vertical velocity without tunnelling', () => {
    const map = level(), w = createWorld(map); w.player.y = 270; w.player.vy = 680;
    stepWorld(w, map, { ...PHYSICS, step: 0.25, acceleration: 0 });
    expect(w.player.y).toBe(436); expect(w.player.vy).toBe(0);
  });
  it('cannot cross a 1px hazard at extreme horizontal velocity', () => {
    const map = level(), w = createWorld(map);
    map.hazards = [{ id: 'thin', x: 400, y: 80, w: 1, h: 380, kind: 'spikes' }];
    w.speed = 100000;
    stepWorld(w, map, { ...PHYSICS, maxSpeed: 100000 });
    expect(w.phase).toBe('dead'); expect(w.deaths).toBe(1);
    run(w, map, 100); expect(w.deaths).toBe(1);
  });
  it('kills side impacts with solid platforms', () => {
    const map = level(), w = createWorld(map);
    map.platforms.push({ id: 'wall', x: 190, y: 400, w: 20, h: 60 });
    run(w, map, 20); expect(w.phase).toBe('dead');
  });
  it('collapses a touched platform once, then resets all ephemeral state on restart', () => {
    const map = level(), w = createWorld(map);
    map.platforms = [{ id: 'temporary', x: 0, y: 460, w: 10000, h: 24, temporary: 0.1 }];
    run(w, map, 12); expect(w.collapsed.size).toBe(1); expect(w.player.y).toBe(436);
    run(w, map, 10); expect(w.player.y).toBeGreaterThan(436);
    run(w, map, 200); expect(w.phase).toBe('dead');
    const restarted = createWorld(map, w.deaths);
    expect(restarted.deaths).toBe(1); expect(restarted.time).toBe(0); expect(restarted.collapsed.size).toBe(0);
    expect(restarted.player.y).toBe(436);
  });
  it('has smooth bounded acceleration and caps vertical velocity', () => {
    const map = level(), w = createWorld(map);
    run(w, map, 120); expect(w.speed).toBeCloseTo(242.4, 8);
    run(w, map, 120 * 70); expect(w.speed).toBe(PHYSICS.maxSpeed);
    w.player.y = 250; w.player.vy = 10000; stepWorld(w, map);
    expect(Math.abs(w.player.vy)).toBeLessThanOrEqual(PHYSICS.maxVerticalSpeed);
  });
  it('freezes physics in every non-playing state', () => {
    for (const phase of ['menu', 'paused', 'dead', 'won'] as const) {
      const w = createWorld(level()); w.phase = phase;
      stepWorld(w, level()); flipGravity(w);
      expect(w.time).toBe(0); expect(w.flips).toBe(0); expect(w.player.x).toBe(160);
    }
  });
});

describe('moving hazards and synchronized traps', () => {
  const moving: Hazard = { id: 'moving', kind: 'moving', x: 160, y: 200, w: 50, h: 40,
    motion: { amplitude: 100, period: 2, phase: 0 } };
  it('uses deterministic sinusoidal bounds', () => {
    expect(hazardRect(moving, 0).y).toBe(200);
    expect(hazardRect(moving, 0.5).y).toBe(300);
    expect(hazardRect(moving, 1.5).y).toBe(100);
    expect(hazardRect(moving, 2).y).toBeCloseTo(200);
  });
  it('sweeps moving hazards against the player', () => {
    const map = level(), w = createWorld(map);
    map.hazards = [{ ...moving, y: 385, motion: { amplitude: 100, period: 0.2, phase: 0 } }];
    run(w, map, 4); expect(w.phase).toBe('dead'); expect(w.deathReason).toBe('Obstacle mobile');
  });
  const pulse: Hazard = { id: 'pulse', kind: 'pulse', x: 160, y: 80, w: 100, h: 380,
    pulse: { period: 3, active: 1.5, phase: 0, warning: 0.6 } };
  it('warns before each activation and includes wrap boundaries', () => {
    expect(isActive(pulse, 0)).toBe(true); expect(isActive(pulse, 1.5)).toBe(false);
    expect(isWarning(pulse, 2.5)).toBe(true); expect(isWarning(pulse, 1.8)).toBe(false);
    expect(activeDuring(pulse, 2.99, 3.01)).toBe(true);
    expect(activeDuring(pulse, 1.6, 2)).toBe(false);
  });
  it('allows passage when inactive and kills upon activation', () => {
    const map = level(), w = createWorld(map); map.hazards = [pulse]; w.time = 2;
    stepWorld(w, map); expect(w.phase).toBe('playing');
    w.time = 2.999; stepWorld(w, map); expect(w.phase).toBe('dead');
  });
  it('does not retroactively kill a player who crossed before activation within the same tick', () => {
    const map = level(), w = createWorld(map);
    map.hazards = [{ ...pulse, x: 200, w: 1 }];
    w.time = 2.993; w.speed = 100000;
    stepWorld(w, map, { ...PHYSICS, maxSpeed: 100000 });
    expect(w.phase).toBe('playing');
  });
});

describe('authored course reachability and framerate independence', () => {
  function replay(fps: number) {
    const world = createWorld(DEMO_LEVEL), clock = new FixedClock(PHYSICS.step);
    const flips = new Set<number>(REFERENCE_FLIPS);
    let tick = 0;
    for (let frame = 0; frame < fps * 90 && world.phase === 'playing'; frame++) clock.advance(1 / fps, () => {
      if (flips.has(tick)) flipGravity(world);
      stepWorld(world, DEMO_LEVEL); tick++;
    });
    return world;
  }
  it.each([30, 60, 120])('reaches the finish with the same rules and acceleration at %i FPS', (fps) => {
    const w = replay(fps);
    expect(w.phase).toBe('won'); expect(w.deaths).toBe(0);
    expect(w.time).toBeGreaterThan(60); expect(w.time).toBeLessThan(90);
    expect(w.player.x).toBeGreaterThanOrEqual(DEMO_LEVEL.length);
    expect(w.flips).toBe(REFERENCE_FLIPS.length);
    expect(w.collapsed.size).toBeGreaterThan(0);
  });
  it('produces identical player state and finish time at 30, 60 and 120 FPS', () => {
    const a = replay(30), b = replay(60), c = replay(120);
    expect(a.player).toEqual(b.player); expect(b.player).toEqual(c.player);
    expect(a.time).toBe(b.time); expect(b.time).toBe(c.time);
  });
  it('retains remainder and bounds stalls instead of fast-forwarding', () => {
    const clock = new FixedClock(1 / 120); let ticks = 0;
    clock.advance(1 / 240, () => ticks++); expect(ticks).toBe(0);
    clock.advance(1 / 240, () => ticks++); expect(ticks).toBe(1);
    clock.advance(10, () => ticks++); expect(ticks).toBe(31);
    clock.reset(); expect(clock.alpha).toBe(0);
  });
});
