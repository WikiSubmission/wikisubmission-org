import { defineConfig } from 'vitest/config'

// Unit tests for pure logic only (scheduling math, parsers, route validation).
// Node environment; UI behavior is exercised
// through the end-to-end host tests, not here. tsconfigPaths
// resolves the dual "@/*" mapping (desktop-local first, then packages/shared).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx,mts}'],
    exclude: ['node_modules', '.next', 'out', 'dist'],
  },
})
