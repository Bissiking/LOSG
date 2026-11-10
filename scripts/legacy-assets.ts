import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';
import type { Plugin } from 'vite';
import { legacyScripts } from '../play/legacy-scripts';

const mime: Record<string, string> = {
  '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ogg': 'audio/ogg', '.txt': 'text/plain', '': 'text/plain',
};

/** Publish only runtime assets, preserving paths used by the original loaders. */
export function legacyAssets(): Plugin {
  const files = new Map<string, string>();
  for (const [id, directory] of [['2048', '2048'], ['hexgl', 'HexGL']] as const) {
    const root = fileURLToPath(new URL(`../GAMES/${directory}/`, import.meta.url));
    const add = (file: string) => files.set(`/play/${id}/${file}`, join(root, file));
    legacyScripts[id].forEach(add);
    add(id === '2048' ? 'LICENSE.txt' : 'LICENSE');
    if (id === 'hexgl') {
      files.set('/play/hexgl/LICENSE.txt', join(root, 'LICENSE'));
      const walk = (directory: string) => {
        for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
          const file = `${directory}/${entry.name}`;
          if (entry.isDirectory()) walk(file);
          else if (/\.(png|jpg|ogg|js)$/.test(file)) add(file);
        }
      };
      ['textures', 'textures.full', 'geometries', 'audio'].forEach(walk);
      ['bg.jpg', 'title.png', 'help-0.png', 'help-1.png', 'touchcontroller.css'].forEach((file) => {
        files.set(`/play/hexgl/css/${file}`, join(root, 'css', file));
      });
    }
  }
  return {
    name: 'losg-legacy-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        let path: string;
        try { path = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname); }
        catch { return next(); }
        const file = files.get(path);
        if (!file) return next();
        res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
        res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
      });
    },
    generateBundle() {
      for (const [path, file] of files) this.emitFile({
        type: 'asset', fileName: path.slice(1), source: readFileSync(file),
      });
    },
  };
}
