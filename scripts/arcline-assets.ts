import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Plugin } from 'vite';

// Keep the original game's music in one place; serve and package it unchanged.
export function arclineAssets(): Plugin {
  const directory = fileURLToPath(new URL('../GAMES/arcline/apps/client/public/audio/music/', import.meta.url));
  const files = readdirSync(directory).filter((name) => /\.(mp3|json)$/.test(name));
  return {
    name: 'losg-arcline-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const prefix = '/play/arcline/audio/music/';
        const pathname = new URL(req.url || '/', 'http://localhost').pathname;
        if (!pathname.startsWith(prefix)) return next();
        let name: string;
        try { name = decodeURIComponent(pathname.slice(prefix.length)); } catch { return next(); }
        if (!files.includes(name)) return next();
        res.setHeader('Content-Type', name.endsWith('.mp3') ? 'audio/mpeg' : 'application/json');
        res.end(req.method === 'HEAD' ? undefined : readFileSync(join(directory, name)));
      });
    },
    generateBundle() {
      for (const name of files) this.emitFile({
        type: 'asset', fileName: `play/arcline/audio/music/${name}`, source: readFileSync(join(directory, name)),
      });
    },
  };
}
