import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { WebSocket } from 'ws';

let processServer;
let base;
before(async () => {
  processServer = spawn(process.execPath, ['--import', 'tsx', 'scripts/serve.ts'], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  base = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('LOSG server did not start')), 10000);
    processServer.once('error', reject);
    processServer.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
    processServer.stderr.on('data', (data) => process.stderr.write(data));
    processServer.stdout.on('data', (data) => {
      const match = String(data).match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
});
after(() => processServer?.kill());

test('production serves LOSG and all seven game entry points with compiled assets', async () => {
  for (const path of ['/', '/play/shiftbreak/', '/play/arcline/', '/play/snake/', '/play/dustbound/', '/play/fouria/', '/play/2048/', '/play/hexgl/']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const html = await response.text();
    assert.doesNotMatch(html, /\/src\/|main\.tsx?/);
    const sources = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    assert.ok(sources.length, path);
    for (const source of sources) {
      const asset = await fetch(base + source);
      assert.equal(asset.status, 200, source);
      assert.match(asset.headers.get('content-type'), source.endsWith('.js') ? /javascript/ : /css/);
    }
  }
  // Dynamically loaded game bundles must also be present and served as JavaScript.
  for (const name of readdirSync('dist/assets').filter((name) => name.endsWith('.js'))) {
    const response = await fetch(`${base}/assets/${name}`);
    assert.equal(response.status, 200, name);
    assert.match(response.headers.get('content-type'), /javascript/);
  }
});

test('legacy games ship original scripts, geometry, textures, audio and licences without archives', async () => {
  for (const [url, original, mime] of [
    ['/play/2048/js/game_manager.js', 'GAMES/2048/js/game_manager.js', /javascript/],
    ['/play/2048/LICENSE.txt', 'GAMES/2048/LICENSE.txt', /text\/plain/],
    ['/play/hexgl/LICENSE.txt', 'GAMES/HexGL/LICENSE', /text\/plain/],
    ['/play/hexgl/libs/Three.dev.js', 'GAMES/HexGL/libs/Three.dev.js', /javascript/],
    ['/play/hexgl/geometries/ships/feisar/feisar.js', 'GAMES/HexGL/geometries/ships/feisar/feisar.js', /javascript/],
    ['/play/hexgl/textures/tracks/cityscape/collision.png', 'GAMES/HexGL/textures/tracks/cityscape/collision.png', /image\/png/],
    ['/play/hexgl/textures.full/tracks/cityscape/diffuse.jpg', 'GAMES/HexGL/textures.full/tracks/cityscape/diffuse.jpg', /image\/jpeg/],
    ['/play/hexgl/audio/bg.ogg', 'GAMES/HexGL/audio/bg.ogg', /audio\/ogg/],
  ]) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type'), mime);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(original));
  }
  for (const path of ['/play/hexgl/package.zip', '/play/hexgl/launch.coffee', '/play/2048/README.md']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal(existsSync('dist/GAMES/HexGL/index.html'), false);
  assert.equal(existsSync('dist/GAMES/2048/index.html'), false);
});

test('Arcline ships its manifest and all four unchanged music files', async () => {
  const manifest = await fetch(`${base}/play/arcline/audio/music/manifest.json`);
  assert.equal(manifest.status, 200);
  const { tracks } = await manifest.json();
  assert.equal(tracks.length, 4);
  for (const { file } of tracks) {
    const response = await fetch(`${base}/play/arcline/audio/music/${encodeURIComponent(file)}`);
    assert.equal(response.status, 200, file);
    assert.equal(response.headers.get('content-type'), 'audio/mpeg');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(`GAMES/arcline/apps/client/public/audio/music/${file}`));
  }
});

test('missing game assets and HTTP requests to the WebSocket endpoint do not serve the LOSG shell', async () => {
  for (const path of ['/assets/missing.js', '/play/missing/', '/play/arcline/audio/music/missing.mp3', '/play/fouria/ws']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
    assert.doesNotMatch(response.headers.get('content-type'), /text\/html/);
  }
});

function player() {
  const socket = new WebSocket(base.replace('http:', 'ws:') + '/play/fouria/ws');
  const messages = [];
  const waiters = [];
  socket.on('error', () => {});
  socket.on('message', (data) => {
    const message = JSON.parse(String(data));
    const index = waiters.findIndex((waiter) => waiter.type === message.type);
    if (index < 0) messages.push(message);
    else { const [waiter] = waiters.splice(index, 1); clearTimeout(waiter.timer); waiter.resolve(message.payload); }
  });
  return {
    socket,
    send(type, payload) { socket.send(JSON.stringify({ type, payload })); },
    next(type) {
      const index = messages.findIndex((message) => message.type === type);
      if (index >= 0) return Promise.resolve(messages.splice(index, 1)[0].payload);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`No Fouria message: ${type}`)), 5000);
        waiters.push({ type, resolve, timer });
      });
    },
  };
}

test('Fouria: two players create/join a room, win, rematch and leave through the LOSG endpoint', async (t) => {
  const host = player(), guest = player();
  t.after(() => { host.socket.terminate(); guest.socket.terminate(); });
  await Promise.all([host.next('connected'), guest.next('connected')]);
  host.send('create_room');
  const room = await host.next('room_created');
  assert.equal(room.player, 'red');
  guest.send('join_room', { roomId: room.roomId });
  assert.equal((await guest.next('room_joined')).player, 'blue');
  await Promise.all([host.next('room_ready'), guest.next('room_ready')]);
  host.send('start');
  await Promise.all([host.next('game_start'), guest.next('game_start')]);
  for (const [sender, column] of [[host, 0], [guest, 1], [host, 0], [guest, 1], [host, 0], [guest, 1], [host, 0]]) {
    sender.send('move', { column });
    const [a, b] = await Promise.all([host.next('move'), guest.next('move')]);
    assert.deepEqual(a.game, b.game);
  }
  const [won, other] = await Promise.all([host.next('game_end'), guest.next('game_end')]);
  assert.equal(won.game.winner, 'red');
  assert.deepEqual(won.game, other.game);
  host.send('rematch');
  await Promise.all([host.next('rematch_state'), guest.next('rematch_state')]);
  guest.send('rematch');
  const [fresh] = await Promise.all([host.next('game_start'), guest.next('game_start')]);
  assert.equal(fresh.game.status, 'playing');
  assert.ok(fresh.game.board.flat().every((cell) => cell === null));
  guest.socket.close();
  await host.next('player_left');
});
