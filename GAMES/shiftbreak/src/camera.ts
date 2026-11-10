// GAMES/shiftbreak/src/camera.ts
export class Camera {
  x = 0;
  target(playerX: number, viewWidth: number): number { return Math.max(0, playerX - viewWidth * 0.25); }
  update(playerX: number, viewWidth: number, seconds: number): void {
    this.x += (this.target(playerX, viewWidth) - this.x) * (1 - Math.exp(-12 * seconds));
  }
  reset(playerX: number, viewWidth: number): void { this.x = this.target(playerX, viewWidth); }
}
