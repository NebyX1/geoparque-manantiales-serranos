import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/seo/**/*.test.ts'],
    coverage: { reporter: ['text', 'html'] },
  },
});
