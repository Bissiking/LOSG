// src/game/LevelManager.ts
import Phaser from 'phaser';
import type { LevelData } from '../levels/level01';
import type { Vehicle } from './Vehicle';

export class LevelManager {
  private readonly scene: Phaser.Scene;
  private readonly data: LevelData;
  private readonly onFinish: (elapsed: number) => void;
  private startedAt = 0;
  private elapsedBeforeFinish = 0;
  private finished = false;

  constructor(scene: Phaser.Scene, data: LevelData, vehicle: Vehicle, onFinish: (elapsed: number) => void) {
    this.scene = scene;
    this.data = data;
    this.onFinish = onFinish;
    scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      if (this.finished) return;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('finish') && labels.includes('buggy-chassis')) {
          this.finish();
          break;
        }
      }
    });
    void vehicle;
  }

  start(): void {
    if (this.startedAt === 0 && !this.finished) this.startedAt = this.scene.time.now;
  }

  reset(): void {
    this.startedAt = 0;
    this.elapsedBeforeFinish = 0;
    this.finished = false;
  }

  getElapsed(): number {
    if (this.finished) return this.elapsedBeforeFinish;
    if (this.startedAt === 0) return 0;
    return this.scene.time.now - this.startedAt;
  }

  getProgress(x: number): number {
    return Phaser.Math.Clamp((x - this.data.start.x) / (this.data.finish.x - this.data.start.x), 0, 1);
  }

  get isFinished(): boolean { return this.finished; }
  get hasStarted(): boolean { return this.startedAt > 0; }

  private finish(): void {
    if (this.startedAt === 0) this.start();
    this.elapsedBeforeFinish = this.scene.time.now - this.startedAt;
    this.finished = true;
    this.onFinish(this.elapsedBeforeFinish);
  }
}
