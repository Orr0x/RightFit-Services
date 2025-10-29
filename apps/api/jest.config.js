module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 24,
      lines: 24,
      statements: 24,
    },
  },
  moduleNameMapper: {
    '^@rightfit/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
}
