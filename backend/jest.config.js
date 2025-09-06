// backend/jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Exclude main entry point
    '!src/seed/**', // Exclude seed files
    '!src/config/**', // Exclude config files
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Module name mapping for ES modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Transform configuration for ES modules
  transform: {},
  
  // Extensions to consider
  moduleFileExtensions: ['js', 'json'],
  
  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,
};