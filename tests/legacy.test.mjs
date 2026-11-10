import { after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: { port: 0 } }, appType: 'custom' });
after(() => server.close());
const { createShipInputReader } = await server.ssrLoadModule('/play/hexgl/controls.ts');
const { createHexRuntime } = await server.ssrLoadModule('/play/hexgl/runtime.ts');
const { installLegacyInputGate } = await server.ssrLoadModule('/play/legacy-input.ts');
afterEach(() => { delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; delete globalThis.document; delete globalThis.window; });
const pad = (pressed = [], axes = [0, 0], extra = {}) => ({ index: 2, id: 'Test controller', connected: true, mapping: 'standard', axes,
  buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: pressed.includes(index), value: Number(pressed.includes(index)) })), ...extra });

test('HexGL: neutral gate, analog steering, triggers, brakes, one restart per press and chord suppression', () => {
  const read = createShipInputReader();
  assert.equal(read(pad([0])).forward, false);
  read(pad());
  assert.deepEqual(read(pad([7, 4], [0.65, 0])), { forward: true, steering: 0.65, leftBrake: true, rightBrake: false, restart: false });
  assert.equal(read(pad([2])).restart, true);
  assert.equal(read(pad([2])).restart, false);
  assert.deepEqual(read(pad([4, 5, 6, 7])), { forward: false, steering: 0, leftBrake: false, rightBrake: false, restart: false });
  assert.equal(read(pad([7])).forward, false);
  read(pad());
  assert.deepEqual(read(pad([6, 14], [0.1, 0])), { forward: false, steering: -1, leftBrake: true, rightBrake: true, restart: false });
});

test('HexGL: disconnect, changed identity, unsupported mapping and resume require neutral again', () => {
  const read = createShipInputReader();
  read(pad()); assert.equal(read(pad([0])).forward, true);
  read(); assert.equal(read(pad([0])).forward, false);
  read(pad());
  assert.equal(read(pad([0], [0, 0], { id: 'Replacement' })).forward, false);
  assert.equal(read(pad([0], [0, 0], { mapping: '' })).forward, false);
});

function runtimeFixture() {
  let renders = 0, clears = 0, suspends = 0, resumes = 0;
  const frames = new Map(); let id = 0;
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const audio = { state: 'running', async suspend() { suspends++; this.state = 'suspended'; }, async resume() { resumes++; this.state = 'running'; } };
  const hex = { active: true, update() { renders++; }, manager: { time: 0 }, gameplay: { timer: { time: { start: 1000, current: 1300, previous: 1280 } } }, components: { shipControls: { key: { forward: true, left: true } } } };
  const runtime = createHexRuntime(() => audio, () => { clears++; });
  return { runtime, hex, frames, counts: () => ({ renders, clears, suspends, resumes }) };
}

test('HexGL pause: freeze rendering, keys and audio; exclude paused wall time from the race', t => {
  t.mock.timers.enable({ apis: ['Date'], now: 1400 });
  const { runtime, hex, frames, counts } = runtimeFixture();
  runtime.attach(hex); assert.equal(frames.size, 1);
  runtime.loop.sleep(); runtime.loop.sleep();
  assert.equal(frames.size, 0);
  assert.deepEqual(hex.components.shipControls.key, { forward: false, left: false });
  assert.deepEqual(counts(), { renders: 1, clears: 1, suspends: 1, resumes: 0 });
  t.mock.timers.tick(5000);
  runtime.loop.wake(); runtime.loop.wake();
  assert.deepEqual(hex.gameplay.timer.time, { start: 6000, current: 6300, previous: 6280 });
  assert.equal(frames.size, 1);
  assert.deepEqual(counts(), { renders: 2, clears: 1, suspends: 1, resumes: 1 });
});

test('HexGL pause: a race loaded behind the overlay stays stopped and keeps its full countdown', t => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const { runtime, hex, frames } = runtimeFixture();
  runtime.loop.sleep(); t.mock.timers.tick(3000);
  hex.gameplay.timer.time = { start: 4000, current: 4000, previous: 4000 };
  runtime.attach(hex);
  assert.equal(frames.size, 0);
  t.mock.timers.tick(2000); runtime.loop.wake();
  assert.equal(hex.gameplay.timer.time.start, 6000);
  assert.equal(frames.size, 1);
});

test('legacy games: capture native keyboard/touch/click input while paused, without blocking active input', () => {
  const target = new EventTarget();
  globalThis.window = target;
  globalThis.document = { hidden: false, hasFocus: () => true, documentElement: { dataset: { losgPaused: 'true' } } };
  installLegacyInputGate();
  let moves = 0;
  target.addEventListener('keydown', () => moves++);
  const key = new Event('keydown', { cancelable: true }); target.dispatchEvent(key);
  assert.equal(key.defaultPrevented, true); assert.equal(moves, 0);
  document.documentElement.dataset.losgPaused = 'false';
  target.dispatchEvent(new Event('keydown', { cancelable: true }));
  assert.equal(moves, 1);
});
