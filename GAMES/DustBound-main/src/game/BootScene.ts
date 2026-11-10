// src/game/BootScene.ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create(): void {
    this.createVehicleTextures();
    this.scene.start('GameScene');
  }

  private createVehicleTextures(): void {
    const chassis = this.make.graphics({ x: 0, y: 0 });
    chassis.fillStyle(0xed674b).fillRoundedRect(4, 10, 148, 40, 10);
    chassis.fillStyle(0x9e382f).fillTriangle(24, 10, 58, 0, 116, 10);
    chassis.lineStyle(5, 0x061a27).strokeRoundedRect(4, 10, 148, 40, 10);
    chassis.lineStyle(4, 0xf5e4bd, 0.9).strokeTriangle(38, 12, 62, 3, 82, 12);
    chassis.lineStyle(4, 0x061a27).strokeLineShape(new Phaser.Geom.Line(91, 12, 116, 45));
    chassis.fillStyle(0x28d7dd).fillCircle(132, 26, 5);
    chassis.generateTexture('buggy-chassis', 156, 56);
    chassis.destroy();

    const wheel = this.make.graphics({ x: 0, y: 0 });
    wheel.fillStyle(0x02080d).fillCircle(32, 32, 30);
    wheel.lineStyle(5, 0x142f3b).strokeCircle(32, 32, 27);
    wheel.lineStyle(3, 0xed674b).strokeCircle(32, 32, 17);
    wheel.fillStyle(0xf5e4bd).fillCircle(32, 32, 6);
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      wheel.lineStyle(3, 0x061a27).strokeLineShape(new Phaser.Geom.Line(
        32 + Math.cos(angle) * 19, 32 + Math.sin(angle) * 19,
        32 + Math.cos(angle) * 27, 32 + Math.sin(angle) * 27,
      ));
    }
    wheel.generateTexture('buggy-wheel', 64, 64);
    wheel.destroy();
  }
}
