import { defineConfig } from 'vitest/config'

// Unit tests for pure logic only (scheduling math, parsers, route validation).
// Node environment — anything needing a DOM or Capacitor plugins is exercised
// on-device / via the Playwright smoke scripts, not here. tsconfigPaths
// resolves the dual "@/*" mapping (mobile-local first, then packages/shared).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'android', 'ios'],
  },
})
