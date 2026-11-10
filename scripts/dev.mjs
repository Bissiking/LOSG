import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--preview');
const args = process.argv.slice(2).filter((arg) => arg !== '--preview');
const modeIndex = args.indexOf('--mode');
const mode = modeIndex >= 0 ? args[modeIndex + 1] : preview ? 'production' : 'development';
const configEnv = loadEnv(mode, root, 'FOURIA_');
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const [command, env] of [
  [['--import', 'tsx', 'scripts/serve.ts'], { PORT: process.env.FOURIA_PORT || configEnv.FOURIA_PORT || '3009', HOST: '127.0.0.1' }],
  [['node_modules/vite/bin/vite.js', ...(preview ? ['preview'] : []), ...args], {}],
]) {
  const child = spawn(process.execPath, command, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
  children.push(child);
  child.on('error', (error) => { console.error(error.message); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
