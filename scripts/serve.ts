import { fileURLToPath } from 'node:url';

process.env.LOSG_DIST_DIR = fileURLToPath(new URL('../dist', import.meta.url));
process.env.FOURIA_WS_PATH = '/play/fouria/ws';
await import('../GAMES/Fouria/server');
