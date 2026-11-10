// GAMES/shiftbreak/src/main.ts
import { PHYSICS, createWorld, flipGravity } from './engine/player';
import { stepWorld } from './engine/physics';
import { FixedClock } from './engine/clock';
import { DEMO_LEVEL as level } from './levels/demo';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { Input, type Command } from './input';
import { UI, type Screen } from './ui';

let world = createWorld(level);
world.phase = 'menu';
let previous = { ...world.player };
let blocked = false, frame = 0, last = performance.now(), flash = 0;
let commands: Command[] = [];
const clock = new FixedClock(PHYSICS.step);
const camera = new Camera();
const ui = new UI(action, (key) => {
  input.key = key;
  ui.setKeyLabel(({ Space: 'Espace', ArrowUp: 'Flèche haut', KeyW: 'W', KeyK: 'K' })[key] ?? key);
});
const renderer = new Renderer(ui.canvas);
const input = new Input(ui.canvas, (command) => {
  if (!blocked) commands.push(command);
}, () => world.phase === 'playing' && !blocked);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function screen(next: Screen): void {
  commands = []; clock.reset(); input.reset(); previous = { ...world.player };
  ui.show(next, world, input.key);
  ui.update(world, level);
}
function start(): void {
  world = createWorld(level, world.deaths);
  camera.reset(world.player.x, renderer.width); flash = 0;
  screen('playing');
}
function action(name: string): void {
  if (blocked || (ui.screen === 'warning' && name !== 'acknowledge')) return;
  if (name === 'acknowledge' || name === 'menu') { world.phase = 'menu'; screen('menu'); }
  else if (name === 'play' || name === 'restart') start();
  else if (name === 'controls' || name === 'about') screen(name);
  else if ((name === 'resume' || name === 'pause') && world.phase === 'paused') {
    world.phase = 'playing'; screen('playing');
  } else if (name === 'pause' && world.phase === 'playing') { world.phase = 'paused'; screen('paused'); }
  // B / Options returns from help to the menu, without bypassing the launch warning.
  else if (name === 'pause' && ['controls', 'about'].includes(ui.screen)) screen('menu');
}
function systemPause(): void {
  blocked = document.documentElement.dataset.losgPaused === 'true';
  commands = []; clock.reset(); input.reset(); previous = { ...world.player };
  last = performance.now();
}
window.addEventListener('losg:pause-change', systemPause);
function loseFocus(): void {
  commands = []; input.reset();
  if (world.phase === 'playing') action('pause');
}
window.addEventListener('blur', loseFocus);
document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); last = performance.now(); clock.reset(); });

function update(now: number): void {
  const dt = Math.max(0, Math.min(0.25, (now - last) / 1000)); last = now;
  input.poll(now, blocked || document.hidden || !document.hasFocus(), ui.panel);
  const current = commands; commands = [];
  for (const command of current) {
    if (command === 'flip' && world.phase === 'playing') { flipGravity(world); flash = reduced.matches ? 0 : 1; }
    else if (command === 'restart') action('restart');
    else if (command === 'pause') action('pause');
  }
  if (!blocked && !document.hidden && world.phase === 'playing') {
    clock.advance(dt, () => {
      previous = { ...world.player };
      stepWorld(world, level);
    });
    if (world.phase !== 'playing') screen(world.phase === 'dead' ? 'dead' : 'won');
  }
  const alpha = world.phase === 'playing' ? clock.alpha : 1;
  const p = { ...world.player, x: previous.x + (world.player.x - previous.x) * alpha,
    y: previous.y + (world.player.y - previous.y) * alpha };
  const preview = world.phase === 'menu';
  const viewPlayer = preview ? { ...p, x: 1460, y: 436, gravity: 1 as const } : p;
  if (!blocked) {
    if (preview || world.phase === 'won' || world.phase === 'dead') camera.x = Math.max(0, viewPlayer.x - renderer.width * 0.64);
    else camera.update(p.x, renderer.width, dt);
    flash = Math.max(0, flash - dt * 5);
  }
  renderer.render(world, level, camera, viewPlayer, flash);
  ui.update(world, level);
  frame = requestAnimationFrame(update);
}
// Match LOSG's runtime contract without taking a dependency on Phaser.
export const game = { loop: {
  sleep() { blocked = true; commands = []; clock.reset(); input.reset(); },
  wake() { blocked = false; last = performance.now(); clock.reset(); },
} };
screen('warning');
frame = requestAnimationFrame(update);
window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); renderer.destroy(); input.destroy(); }, { once: true });
