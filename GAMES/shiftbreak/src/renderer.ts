// GAMES/shiftbreak/src/renderer.ts
import { hazardRect, isActive, isWarning, pulsePhase } from './engine/obstacles';
import type { Level, Player, World } from './engine/types';
import type { Camera } from './camera';
const C = { ink: '#0d191e', muted: '#40565b', rail: '#c7d1c7', paper: '#eef0df', cyan: '#7ee0d1', danger: '#ff846b', temporary: '#edce7a' };
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  width = 960;
  private observer: ResizeObserver;
  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D indisponible');
    this.ctx = ctx;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }
  private resize(): void {
    const { width, height } = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.width = Math.max(600, width / Math.max(height, 1) * 540);
  }
  render(world: World, level: Level, camera: Camera, p: Player, flipFlash: number): void {
    const c = this.ctx, w = this.width;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = C.ink; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Constant world height; portrait shows less track but retains a safe lookahead at maximum speed.
    const scale = Math.min(this.canvas.width / w, this.canvas.height / level.height);
    c.setTransform(scale, 0, 0, scale, (this.canvas.width - w * scale) / 2, (this.canvas.height - level.height * scale) / 2);
    c.fillStyle = C.ink; c.fillRect(0, 0, w, 540);
    c.strokeStyle = '#1c3036'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, 270); c.lineTo(w, 270); c.stroke();
    // Distance marks belong to the track, never a decorative interface grid.
    for (let x = Math.floor(camera.x / 500) * 500; x < camera.x + w; x += 500) {
      const sx = x - camera.x;
      c.fillStyle = C.muted; c.fillRect(sx, 500, 1, 9);
      c.font = '11px "JetBrains Mono", monospace'; c.fillText(`${x} px`, sx + 8, 508);
    }
    c.save(); c.translate(-camera.x, 0);
    for (const section of level.sections) {
      if (section.x < camera.x - 600 || section.x > camera.x + w) continue;
      c.fillStyle = '#243b41'; c.font = '600 36px "Exo 2", sans-serif';
      c.fillText(section.name.toUpperCase(), section.x + 50, 306);
      c.fillRect(section.x, 110, 1, 320);
    }
    for (const platform of level.platforms) {
      if (platform.x > camera.x + w || platform.x + platform.w < camera.x) continue;
      const touched = world.collapsed.get(platform.id);
      const elapsed = touched === undefined ? 0 : world.time - touched;
      if (platform.temporary !== undefined && touched !== undefined && elapsed >= platform.temporary) continue;
      c.fillStyle = platform.temporary !== undefined ? C.temporary : C.rail;
      c.globalAlpha = touched === undefined ? 1 : Math.max(0.25, 1 - elapsed / platform.temporary!);
      const left = Math.max(camera.x, platform.x), right = Math.min(camera.x + w, platform.x + platform.w);
      if (platform.temporary !== undefined) {
        for (let x = platform.x; x < right; x += 28) c.fillRect(x, platform.y, Math.min(20, right - x), platform.h);
      } else c.fillRect(left, platform.y, right - left, platform.h);
      c.globalAlpha = 1;
    }
    for (const hazard of level.hazards) {
      if (hazard.x > camera.x + w + 20 || hazard.x + hazard.w < camera.x - 20) continue;
      const rect = hazardRect(hazard, world.time);
      const active = isActive(hazard, world.time), warning = isWarning(hazard, world.time);
      c.fillStyle = active ? C.danger : warning ? C.temporary : C.muted;
      if (hazard.kind === 'pulse') {
        c.setLineDash(active ? [] : [8, 8]); c.strokeStyle = c.fillStyle; c.lineWidth = 3;
        c.strokeRect(rect.x, rect.y, rect.w, rect.h); c.setLineDash([]);
        if (active) { c.globalAlpha = 0.32; c.fillRect(rect.x, rect.y, rect.w, rect.h); c.globalAlpha = 1; }
        c.font = '12px "JetBrains Mono", monospace';
        const phase = pulsePhase(hazard, world.time), timing = hazard.pulse!;
        c.fillText(active ? 'ACTIF' : warning ? 'ATTENTION' : 'LIBRE', rect.x - 4, rect.y + rect.h / 2);
        const progress = active ? (timing.active - phase) / timing.active : (timing.period - phase) / (timing.period - timing.active);
        c.fillRect(rect.x, rect.y - 10, rect.w * Math.max(0, progress), 3);
      } else {
        if (hazard.motion) {
          c.strokeStyle = C.muted; c.setLineDash([4, 6]);
          c.beginPath(); c.moveTo(rect.x + rect.w / 2, hazard.y - hazard.motion.amplitude);
          c.lineTo(rect.x + rect.w / 2, hazard.y + hazard.motion.amplitude + hazard.h); c.stroke(); c.setLineDash([]);
        }
        c.fillRect(rect.x, rect.y, rect.w, rect.h);
        c.save(); c.beginPath(); c.rect(rect.x, rect.y, rect.w, rect.h); c.clip();
        c.strokeStyle = C.ink; c.lineWidth = 4;
        for (let i = -rect.h; i < rect.w; i += 18) {
          c.beginPath(); c.moveTo(rect.x + i, rect.y); c.lineTo(rect.x + i + rect.h, rect.y + rect.h); c.stroke();
        }
        c.restore();
      }
    }
    const finish = level.length + 24;
    c.fillStyle = C.cyan; c.fillRect(finish, 80, 5, 380);
    c.font = '600 24px "Exo 2", sans-serif'; c.fillText('ARRIVÉE', finish - 110, 260);
    // A split square: solid core, notched nose and a gravity-facing cut, original geometric silhouette.
    c.save(); c.translate(p.x + p.w / 2, p.y + p.h / 2);
    c.fillStyle = world.phase === 'dead' ? C.danger : C.cyan;
    c.beginPath(); c.moveTo(-12, -12); c.lineTo(7, -12); c.lineTo(14, 0); c.lineTo(7, 12); c.lineTo(-12, 12); c.closePath(); c.fill();
    c.fillStyle = C.ink; c.fillRect(-7, p.gravity > 0 ? 4 : -8, 12, 4);
    c.restore();
    if (flipFlash > 0) {
      c.strokeStyle = C.cyan; c.globalAlpha = flipFlash; c.lineWidth = 2;
      c.beginPath(); c.arc(p.x + 12, p.y + 12, 22 + (1 - flipFlash) * 18, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
    c.restore();
  }
  destroy(): void { this.observer.disconnect(); }
}
