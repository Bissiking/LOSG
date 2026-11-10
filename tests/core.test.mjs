// tests/core.test.mjs
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Vite loads the actual TypeScript modules; Node provides assertions and mocks.
// No browser is launched and these tests do not claim to verify UI interactions.
const server = await createServer({ server: { middlewareMode: true, hmr: { port: 0 } }, appType: 'custom' });
after(() => server.close());
const { resolveGameUrl, openGameTab } = await server.ssrLoadModule('/src/lib/launch.ts');
const { usePrefs } = await server.ssrLoadModule('/src/hooks/usePrefs.ts');
const { GAMES } = await server.ssrLoadModule('/src/config/games.ts');
const { createStartupSequence } = await server.ssrLoadModule('/src/lib/startup.ts');
const { createSystemButtonTracker } = await server.ssrLoadModule('/src/lib/systemGamepad.ts');
const { createGamePauseController } = await server.ssrLoadModule('/play/pause.ts');
const { startGame } = await server.ssrLoadModule('/play/bridge.ts');
const { createPadActionReader, describeControllers, controllerType, driveInput, adjustPadAim, controllerForTurn } = await server.ssrLoadModule('/src/lib/gamepad.ts');
const { createPadScrollReader } = await server.ssrLoadModule('/src/lib/padScroll.ts');
const base = 'https://luma.test/';

function pad(pressed = [], extra = {}) {
  return { index: 0, id: 'Test controller', axes: [0, 0], connected: true, mapping: 'standard', buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: pressed.includes(index) })), ...extra };
}

test('system menu: Guide and Start are left to the OS/game; only a held four-shoulder chord toggles', () => {
  const read = createSystemButtonTracker();
  assert.equal(read([pad([16])], 0), false);
  assert.equal(read([pad([9])], 500), false);
  assert.equal(read([pad([4,5,6,7])], 1000), false);
  assert.equal(read([pad([4,5,6,7])], 1399), false);
  assert.equal(read([pad([4,5,6,7])], 1400), true);
  assert.equal(read([pad([4,5,6,7])], 9000), false);
  assert.equal(read([pad()], 9100), false);
  assert.equal(read([pad([4,5,6,7])], 9200), false);
  assert.equal(read([pad([4,5,6,7])], 9600), true);
});

test('system menu: chords cannot be assembled across controllers; disconnect and short presses reset the timer', () => {
  const read = createSystemButtonTracker();
  assert.equal(read([pad([4,5]), pad([6,7], { index: 1 })], 0), false);
  assert.equal(read([pad([4,5]), pad([6,7], { index: 1 })], 1000), false);
  assert.equal(read([pad([4,5,6,7], { index: 1 })], 1100), false);
  assert.equal(read([], 1400), false);
  assert.equal(read([pad([4,5,6,7], { index: 1 })], 1500), false);
  assert.equal(read([pad([4,5,6,7], { index: 1 })], 1900), true);
  assert.equal(read([pad([4,5,6,7], { mapping: '' })], 2000), false);
});

test('controllers: names, families, unsupported devices and sparse player ports remain visible', () => {
  assert.equal(controllerType('DualSense Wireless Controller'), 'PlayStation · DualSense');
  assert.equal(controllerType('Xbox 360 Controller (XInput)'), 'Xbox');
  assert.equal(controllerType('Nintendo Switch Pro Controller'), 'Nintendo');
  assert.equal(controllerType('Steam Virtual Gamepad'), 'Steam');
  assert.deepEqual(describeControllers([pad([], {index: 2, id: 'Unknown', mapping: ''})]), [{
    index: 2, player: 3, name: 'Unknown', type: 'Manette générique', supported: false,
  }]);
});

test('navigation: held launch/return buttons need release, edges are per device, directions repeat with deadzone', () => {
  const read = createPadActionReader();
  assert.deepEqual(read([pad([0])], 0), []);
  assert.deepEqual(read([pad([0])], 100), []);
  read([pad()], 200);
  assert.deepEqual(read([pad([0])], 300)[0].actions, ['accept']);
  read([pad(), pad([], { index: 1 })], 400);
  const events = read([pad([15]), pad([0], { index: 1 })], 500);
  assert.deepEqual(events.map(({pad, actions}) => [pad.index, actions]), [[0,['right']], [1,['accept']]]);
  assert.deepEqual(read([pad([15])], 879), []);
  assert.deepEqual(read([pad([15])], 880)[0].actions, ['right']);
  assert.deepEqual(read([pad([], { axes: [0.2, -0.2] })], 900), []);
  assert.deepEqual(read([pad([4,5,6,7])], 1000), []);
  read([], 1100);
  assert.deepEqual(read([pad([0])], 1200), []);
});

test('Fouria: one controller is shared; two controllers own separate turns even with missing ports', () => {
  const pads = [pad([], {index: 3}), pad([], {index: 1})];
  assert.equal(controllerForTurn(pads, 0), 1);
  assert.equal(controllerForTurn(pads, 1), 3);
  assert.equal(controllerForTurn([pads[0]], 0), 3);
  assert.equal(controllerForTurn([pads[0]], 1), 3);
  assert.equal(controllerForTurn([pad([], {mapping: ''})], 0), undefined);
});

test('scroll: right stick has a neutral gate, deadzone, analog speed and bounded elapsed time', () => {
  const read = createPadScrollReader();
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] })], 0), 0);
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] })], 16), 0);
  assert.equal(read([pad([], { axes: [0, 0, 0, 0] })], 32), 0);
  assert.equal(read([pad([], { axes: [0, 0, 0, 0.17] })], 48), 0);
  assert.ok(Math.abs(read([pad([], { axes: [0, 0, 0, 1] })], 64) - 14.4) < 0.001);
  assert.ok(Math.abs(read([pad([], { axes: [0, 0, 0, -0.59] })], 80) + 7.2) < 0.001);
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] })], 10000), 45);
  assert.equal(read([pad([15])], 10016), 0, 'left-stick/cross navigation does not scroll independently');
});

test('scroll: chord, disconnect, replacement and unsupported pads cannot bypass neutral gating', () => {
  const read = createPadScrollReader();
  read([pad()], 0);
  assert.equal(read([pad([4, 5, 6, 7], { axes: [0, 0, 0, 1] })], 16), 0);
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] })], 32), 0);
  read([pad()], 48); read([], 64);
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] })], 80), 0);
  read([pad()], 96);
  assert.equal(read([pad([], { id: 'Replacement', axes: [0, 0, 0, 1] })], 112), 0);
  assert.equal(read([pad([], { mapping: '', axes: [0, 0, 0, 1] })], 128), 0);
});

test('scroll: multiple devices do not multiply speed and nonstandard devices cannot interfere', () => {
  const read = createPadScrollReader();
  read([pad(), pad([], { index: 2 })], 0);
  assert.equal(read([pad([], { axes: [0, 0, 0, 1] }), pad([], { index: 2, axes: [0, 0, 0, 1] })], 20), 18);
  assert.equal(read([pad([], { connected: false, axes: [0, 0, 0, 1] })], 40), 0);
});

test('DustBound: analog triggers, steering deadzone, reverse and menu chord suppression', () => {
  const controller = pad([], { axes: [0.6, 0] });
  controller.buttons[7].value = 0.7;
  assert.deepEqual(driveInput(controller), { throttle: 0.7, tilt: 0.6 });
  controller.buttons[6].value = 1;
  assert.ok(Math.abs(driveInput(controller).throttle + 0.3) < 0.0001);
  assert.deepEqual(driveInput(pad([], { axes: [0.1, 0] })), {throttle: 0, tilt: 0});
  assert.deepEqual(driveInput(pad([4,5,6,7])), {throttle: 0, tilt: 0});
  assert.deepEqual(driveInput(), {throttle: 0, tilt: 0});
});

test('Arcline: aim stays within valid shot bounds and clamps elapsed time after a suspended frame', () => {
  assert.deepEqual(adjustPadAim(89, 99, pad([12,15]), 10000), {angle: 90, power: 100});
  assert.deepEqual(adjustPadAim(1, 4, pad([13,14]), 10000), {angle: 0, power: 3});
  assert.deepEqual(adjustPadAim(45, 70, pad([4,5,6,7,12]), 50), {angle: 45, power: 70});
  assert.deepEqual(adjustPadAim(45, 70, pad(), 50), {angle: 45, power: 70});
});

test('pause: freeze the engine and playing audio, reset keys, then resume only once', () => {
  const calls = [];
  let playing = true;
  const sound = { pause() { playing = false; calls.push('audio:pause'); }, resume() { calls.push('audio:resume'); } };
  const runtime = {
    loop: { sleep() { calls.push('sleep'); }, wake() { calls.push('wake'); } },
    input: { keyboard: { resetKeys() { calls.push('keys:reset'); } } },
    sound: { getAllPlaying() { return playing ? [sound] : []; } },
  };
  const control = createGamePauseController();
  control.attach(runtime);
  control.resume();
  assert.deepEqual(calls, []);
  control.pause(); control.pause();
  assert.deepEqual(calls, ['sleep', 'keys:reset', 'audio:pause']);
  control.resume(); control.resume();
  assert.deepEqual(calls, ['sleep', 'keys:reset', 'audio:pause', 'wake', 'audio:resume']);
});

test('pause: opening the overlay before loading or Phaser boot still freezes the arriving engine', async () => {
  const calls = [];
  let ready;
  const control = createGamePauseController();
  control.pause();
  control.attach({
    loop: { sleep() { calls.push('sleep'); }, wake() { calls.push('wake'); } },
    events: { once(event, callback) { assert.equal(event, 'ready'); ready = callback; } },
  });
  assert.deepEqual(calls, ['sleep']);
  ready();
  await Promise.resolve();
  assert.deepEqual(calls, ['sleep', 'sleep']);
  control.resume();
  assert.equal(calls.at(-1), 'wake');
});

test('game bridge: verify the parent, pause, wait for button release and forward F1', async (t) => {
  const names = ['window', 'document', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const originals = new Map(names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  t.after(() => {
    for (const name of names) {
      const descriptor = originals.get(name);
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const messages = [], calls = [], frames = new Map();
  const parent = { postMessage(data, origin) { messages.push([data.type, origin]); } };
  const windowFake = Object.assign(new EventTarget(), { parent, location: { origin: 'https://luma.test' } });
  const documentFake = { documentElement: { dataset: {} } };
  let controller = pad();
  let nextFrame = 0;
  for (const [name, value] of Object.entries({
    window: windowFake, document: documentFake, navigator: { getGamepads: () => [controller] },
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
  })) Object.defineProperty(globalThis, name, { value, configurable: true });
  await startGame(async () => ({ game: { loop: { sleep() { calls.push('sleep'); }, wake() { calls.push('wake'); } } } }));
  assert.deepEqual(messages, [['losg:ready', 'https://luma.test']]);
  const send = (type, origin = 'https://luma.test', source = parent) => {
    const event = new Event('message');
    Object.assign(event, { data: { type }, origin, source });
    windowFake.dispatchEvent(event);
  };
  send('losg:pause', 'https://other.test');
  send('losg:pause', 'https://luma.test', {});
  assert.deepEqual(calls, []);
  send('losg:pause');
  assert.deepEqual(calls, ['sleep']);
  assert.equal(documentFake.documentElement.dataset.losgPaused, 'true');
  controller = pad([0]);
  send('losg:resume');
  assert.deepEqual(calls, ['sleep']);
  assert.equal(frames.size, 1);
  controller = pad();
  const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback());
  assert.deepEqual(calls, ['sleep', 'wake']);
  assert.equal(documentFake.documentElement.dataset.losgPaused, 'false');
  const key = new Event('keydown', { cancelable: true });
  Object.assign(key, { key: 'F1', repeat: false });
  windowFake.dispatchEvent(key);
  assert.equal(key.defaultPrevented, true);
  assert.deepEqual(messages.at(-1), ['losg:menu', 'https://luma.test']);
});

test('startup: cached artwork still allows a short logo sequence then exits', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const phases = [];
  const startup = createStartupSequence((phase) => phases.push(phase), true);
  startup.ready();
  t.mock.timers.tick(1099);
  assert.deepEqual(phases, []);
  t.mock.timers.tick(1);
  assert.deepEqual(phases, ['leaving']);
  t.mock.timers.tick(280);
  assert.deepEqual(phases, ['leaving', 'done']);
  startup.cancel();
});

test('startup: disabled animations expose the ready app without an artificial delay', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const phases = [];
  const startup = createStartupSequence((phase) => phases.push(phase), false);
  startup.ready();
  assert.deepEqual(phases, ['done']);
  t.mock.timers.tick(10000);
  assert.deepEqual(phases, ['done']);
});

test('startup: a hanging image cannot block the collection indefinitely', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const phases = [];
  const startup = createStartupSequence((phase) => phases.push(phase), true);
  t.mock.timers.tick(4000);
  assert.deepEqual(phases, ['leaving']);
  t.mock.timers.tick(280);
  startup.ready();
  assert.deepEqual(phases, ['leaving', 'done']);
});

test('startup: skipping cancels remaining callbacks and ignores late readiness', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const phases = [];
  const startup = createStartupSequence((phase) => phases.push(phase), true);
  startup.skip();
  startup.ready();
  startup.skip();
  t.mock.timers.tick(10000);
  assert.deepEqual(phases, ['done']);
});

test('startup: unmount cancels every scheduled phase update', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const phases = [];
  const startup = createStartupSequence((phase) => phases.push(phase), true);
  startup.ready();
  startup.cancel();
  t.mock.timers.tick(10000);
  startup.ready();
  assert.deepEqual(phases, []);
});

test('startup: changing motion preference interrupts the entrance or exit immediately', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  const entrance = [];
  const first = createStartupSequence((phase) => entrance.push(phase), true);
  first.ready();
  first.setAnimations(false);
  assert.deepEqual(entrance, ['done']);
  const exit = [];
  const second = createStartupSequence((phase) => exit.push(phase), true);
  second.ready();
  t.mock.timers.tick(1100);
  second.setAnimations(false);
  assert.deepEqual(exit, ['leaving', 'done']);
  t.mock.timers.tick(10000);
  assert.deepEqual(exit, ['leaving', 'done']);
});

test('launch URLs: accept HTTP(S) and local paths', () => {
  assert.equal(resolveGameUrl('/games/local/index.html', base), `${base}games/local/index.html`);
  assert.equal(resolveGameUrl('https://game.test/play?q=1#start', base), 'https://game.test/play?q=1#start');
  assert.equal(resolveGameUrl('http://localhost:3000', base), 'http://localhost:3000/');
});

test('launch URLs: reject executable, non-web, empty and malformed addresses', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///C:/game.html', 'ftp://game.test', '', '   ', 'https://[bad']) {
    assert.equal(resolveGameUrl(url, base), null, url);
  }
});

test('new tab: report popup blocking without throwing', () => {
  globalThis.window = { open: () => null };
  assert.equal(openGameTab('https://game.test'), false);
  delete globalThis.window;
});

test('new tab: recover when browser policies throw on window.open', () => {
  globalThis.window = { open() { throw new Error('Blocked by browser'); } };
  assert.equal(openGameTab('https://game.test'), false);
  delete globalThis.window;
});

test('new tab: isolate the opener before navigating', () => {
  const order = [];
  const popup = {
    set opener(value) { assert.equal(value, null); order.push('isolate'); },
    location: { replace(url) { assert.equal(url, 'https://game.test'); order.push('navigate'); } },
    close() { assert.fail('Successful popup should remain open'); },
  };
  globalThis.window = { open: (url, target) => { assert.equal(url, 'about:blank'); assert.equal(target, '_blank'); return popup; } };
  assert.equal(openGameTab('https://game.test'), true);
  assert.deepEqual(order, ['isolate', 'navigate']);
  delete globalThis.window;
});

test('new tab: close a blank tab if navigation fails', () => {
  let closed = false;
  globalThis.window = { open: () => ({ opener: {}, location: { replace() { throw new Error('blocked'); } }, close() { closed = true; } }) };
  assert.equal(openGameTab('https://game.test'), false);
  assert.equal(closed, true);
  delete globalThis.window;
});

function readPreferences(raw, throws = false) {
  globalThis.localStorage = { getItem() { if (throws) throw new Error('storage disabled'); return raw; } };
  let result;
  function Probe() { [result] = usePrefs(); return null; }
  renderToStaticMarkup(createElement(Probe));
  delete globalThis.localStorage;
  return result;
}
const defaults = { animations: true, glow: true, launch: 'default' };

test('preferences: retain valid V0.1 settings', () => {
  assert.deepEqual(readPreferences('{"animations":false,"glow":false,"launch":"embed"}'), { animations: false, glow: false, launch: 'embed' });
  assert.deepEqual(readPreferences('{"launch":"newTab"}'), { ...defaults, launch: 'newTab' });
});

test('preferences: recover from invalid JSON, unavailable storage, null and wrong field types', () => {
  for (const raw of ['{broken', 'null', '42', '{}', '{"animations":"false","glow":0,"launch":"invalid"}', '[1,2]']) {
    assert.deepEqual(readPreferences(raw), defaults, raw);
  }
  assert.deepEqual(readPreferences(null, true), defaults);
});

test('catalogue: six bundled games and one external application retain stable IDs and art', () => {
  assert.deepEqual(GAMES.map(({ id, url }) => [id, url]), [
    ['arcline', '/play/arcline/'], ['fouria', '/play/fouria/'], ['ctpasimal', 'https://ctpasimal.mhemery.fr/'],
    ['luma-snake', '/play/snake/'], ['2048', '/play/2048/'], ['hexgl', '/play/hexgl/'], ['dustbound', '/play/dustbound/'],
  ]);
  assert.equal(new Set(GAMES.map((game) => game.id)).size, 7);
  assert.equal(GAMES.filter((game) => game.local).length, 6);
  for (const game of GAMES) {
    assert.ok(!game.demo);
    if (game.local) {
      assert.equal(game.launchMode, 'embed');
      assert.ok(game.controls);
      assert.ok(existsSync(`.${game.url}index.html`), game.url);
    }
    for (const [key, dimensions] of [['cover', [1280, 720]], ['background', [1920, 1080]]]) {
      const image = game[key];
      assert.ok(image?.startsWith('/games/'), 'Illustrations must be local');
      assert.ok(existsSync(`public${image}`), image);
      const contents = readFileSync(`public${image}`);
      if (image.endsWith('.svg')) {
        assert.match(contents.toString(), new RegExp(`width=['"]${dimensions[0]}['"] height=['"]${dimensions[1]}['"]`));
      } else assert.deepEqual(jpegDimensions(contents), dimensions, image);
    }
  }
});

// Read JPEG frame dimensions without introducing an image/test dependency.
function jpegDimensions(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8, 'Expected JPEG');
  let offset = 2;
  while (offset < buffer.length) {
    assert.equal(buffer[offset++], 0xff);
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    const length = buffer.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return [buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3)];
    offset += length;
  }
  assert.fail('JPEG dimensions not found');
}

test('Harmonix is absent from the active catalogue', () => {
  assert.ok(GAMES.every((game) => game.id !== 'harmonix'));
});

test('empty catalogue: home renders a recovery state', async () => {
  globalThis.matchMedia = () => ({ matches: false });
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const saved = GAMES.splice(0);
  try {
    const markup = renderToStaticMarkup(createElement(App));
    assert.match(markup, /Ajoutez vos jeux dans le catalogue/);
    assert.doesNotMatch(markup, /Jouer à undefined/);
  } finally { GAMES.push(...saved); delete globalThis.matchMedia; }
});
