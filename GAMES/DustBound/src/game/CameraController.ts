// src/game/CameraController.ts
import Phaser from 'phaser';
import type { Vehicle } from './Vehicle';

export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly vehicle: Vehicle;
  private readonly levelWidth: number;

  constructor(scene: Phaser.Scene, vehicle: Vehicle, levelWidth: number) {
    this.camera = scene.cameras.main;
    this.vehicle = vehicle;
    this.levelWidth = levelWidth;
    this.camera.setBounds(0, -220, levelWidth, 1200);
    this.camera.setBackgroundColor('#061a27');
    this.resize(this.camera.width, this.camera.height);
  }

  update(): void {
    const viewWidth = this.camera.width / this.camera.zoom;
    const viewHeight = this.camera.height / this.camera.zoom;
    const targetX = Phaser.Math.Clamp(this.vehicle.x - viewWidth * 0.32, 0, Math.max(0, this.levelWidth - viewWidth));
    const targetY = Phaser.Math.Clamp(this.vehicle.y - viewHeight * 0.55, -120, 260);
    this.camera.scrollX = Phaser.Math.Linear(this.camera.scrollX, targetX, 0.075);
    this.camera.scrollY = Phaser.Math.Linear(this.camera.scrollY, targetY, 0.06);
  }

  resize(width: number, height: number): void {
    const landscapeScale = Phaser.Math.Clamp(Math.min(width / 1150, height / 700), 0.7, 1.12);
    this.camera.setZoom(landscapeScale);
  }

  snap(): void {
    const viewWidth = this.camera.width / this.camera.zoom;
    const viewHeight = this.camera.height / this.camera.zoom;
    this.camera.scrollX = Phaser.Math.Clamp(this.vehicle.x - viewWidth * 0.32, 0, this.levelWidth - viewWidth);
    this.camera.scrollY = Phaser.Math.Clamp(this.vehicle.y - viewHeight * 0.55, -120, 260);
  }
}
