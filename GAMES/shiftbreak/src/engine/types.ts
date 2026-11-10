// GAMES/shiftbreak/src/engine/types.ts
export type Gravity = -1 | 1;
export type Phase = 'menu' | 'playing' | 'paused' | 'dead' | 'won';
export interface Rect { x: number; y: number; w: number; h: number }
export interface Player extends Rect { vy: number; gravity: Gravity; grounded: boolean }
export interface Platform extends Rect { id: string; temporary?: number }
export interface Hazard extends Rect {
  id: string;
  kind: 'spikes' | 'moving' | 'pulse';
  motion?: { amplitude: number; period: number; phase: number };
  pulse?: { period: number; active: number; phase: number; warning: number };
}
export interface Section { x: number; name: string; hint: string }
export interface Level {
  name: string; length: number; height: number;
  spawn: { x: number; y: number };
  platforms: Platform[]; hazards: Hazard[]; sections: Section[];
}
export interface PhysicsConfig {
  step: number; acceleration: number; maxVerticalSpeed: number; flipSpeed: number;
  initialSpeed: number; horizontalAcceleration: number; maxSpeed: number;
}
export interface World {
  player: Player; phase: Phase; time: number; speed: number; deaths: number;
  flips: number; collapsed: Map<string, number>; deathReason: string;
}
