// src/game/Terrain.ts
import Phaser from 'phaser';
import type { LevelData } from '../levels/level01';

export class Terrain {
  private readonly scene: Phaser.Scene;
  private readonly data: LevelData;
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, data: LevelData) {
    this.scene = scene;
    this.data = data;
    this.graphics = scene.add.graphics().setDepth(-2);
    this.createBackdrop();
    this.createGround();
    this.createPlatforms();
    this.createMarkers();
  }

  private createBackdrop(): void {
    const far = this.scene.add.graphics().setDepth(-5).setScrollFactor(0.18, 0.2);
    far.fillStyle(0x0a3041);
    far.beginPath().moveTo(-600, 500);
    for (let x = -600; x <= 3000; x += 240) {
      const height = 270 + ((x / 240) % 4) * 35;
      far.lineTo(x, height).lineTo(x + 150, height - 70).lineTo(x + 240, 500);
    }
    far.lineTo(3200, 900).lineTo(-600, 900).closePath().fillPath();

    const near = this.scene.add.graphics().setDepth(-4).setScrollFactor(0.42, 0.45);
    near.fillStyle(0x124253);
    near.beginPath().moveTo(-400, 570);
    for (let x = -400; x <= 4200; x += 320) {
      near.lineTo(x, 520).lineTo(x + 90, 420).lineTo(x + 210, 455).lineTo(x + 320, 570);
    }
    near.lineTo(4400, 900).lineTo(-400, 900).closePath().fillPath();

    const stars = this.scene.add.graphics().setDepth(-6).setScrollFactor(0.06);
    for (let index = 0; index < 90; index += 1) {
      const x = (index * 227) % 1900;
      const y = 35 + ((index * 83) % 350);
      stars.fillStyle(index % 7 === 0 ? 0x28d7dd : 0xf5e4bd, index % 5 === 0 ? 0.8 : 0.38);
      stars.fillCircle(x, y, index % 9 === 0 ? 1.8 : 1);
    }
  }

  private createGround(): void {
    const points = this.data.terrain;
    for (let index = 0; index < points.length - 1; index += 1) {
      const from = points[index];
      const to = points[index + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) + 10;
      const angle = Math.atan2(dy, dx);
      const midX = (from.x + to.x) / 2 - Math.sin(angle) * 68;
      const midY = (from.y + to.y) / 2 + Math.cos(angle) * 68;
      this.scene.matter.add.rectangle(midX, midY, length, 145, {
        isStatic: true,
        angle,
        friction: 0.95,
        label: 'terrain',
      });
    }

    this.graphics.fillStyle(0x9f542e).beginPath().moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => this.graphics.lineTo(point.x, point.y));
    this.graphics.lineTo(this.data.width, 1100).lineTo(0, 1100).closePath().fillPath();
    this.graphics.lineStyle(10, 0xd68945, 1).beginPath().moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => this.graphics.lineTo(point.x, point.y));
    this.graphics.strokePath();
    this.graphics.lineStyle(3, 0xf0b65e, 0.6).beginPath().moveTo(points[0].x, points[0].y - 5);
    points.slice(1).forEach((point) => this.graphics.lineTo(point.x, point.y - 5));
    this.graphics.strokePath();
  }

  private createPlatforms(): void {
    this.data.platforms.forEach((platform) => {
      const angle = platform.angle ?? 0;
      this.scene.matter.add.rectangle(platform.x, platform.y, platform.width, 26, {
        isStatic: true,
        angle,
        friction: 0.95,
        label: 'terrain',
      });
      this.scene.add.rectangle(platform.x, platform.y, platform.width, 26, 0x102f3d)
        .setRotation(angle)
        .setStrokeStyle(4, 0x28d7dd, 0.8)
        .setDepth(-1);
    });
  }

  private createMarkers(): void {
    this.drawGate(this.data.start.x - 150, 520, 'START');
    this.drawGate(this.data.finish.x, this.data.finish.y, 'FINISH');
    this.scene.matter.add.rectangle(this.data.finish.x, this.data.finish.y - 90, 50, 220, {
      isStatic: true,
      isSensor: true,
      label: 'finish',
    });
  }

  private drawGate(x: number, groundY: number, label: string): void {
    const gate = this.scene.add.container(x, groundY - 92).setDepth(-1);
    const g = this.scene.add.graphics();
    g.fillStyle(0x28d7dd).fillRect(-8, -70, 16, 150).fillRect(-62, -72, 124, 16);
    g.fillStyle(0x061a27).fillTriangle(-9, -45, 9, -45, 0, -31);
    const text = this.scene.add.text(0, -64, label, {
      fontFamily: 'Bebas Neue', fontSize: '18px', color: '#061a27', letterSpacing: 2,
    }).setOrigin(0.5);
    gate.add([g, text]);
  }
}
