/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        // Override tsconfig for tests — include jest globals
        types: ['jest', 'node'],
        strict: true,
        esModuleInterop: true,
        target: 'ES2020',
        module: 'commonjs',
      }
    }]
  }
};
