import { defineConfig } from 'vitest/config'

// Testes de lógica pura (sem Nuxt): timeline, contador, cache key, exemplos e conversão de áudio.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
