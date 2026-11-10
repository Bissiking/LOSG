import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@arcline/shared': fileURLToPath(new URL('./GAMES/arcline/packages/shared/src/index.ts', import.meta.url)) } },
  test: { environment: 'node', include: ['GAMES/**/*.test.ts'] },
});
