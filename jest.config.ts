import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setup-polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@data/(.*)$': '<rootDir>/_workspace/data/$1',
    '^@schemas/(.*)$': '<rootDir>/schemas/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@workspace/(.*)$': '<rootDir>/_workspace/$1',
    '^lucide-react$': '<rootDir>/tests/__mocks__/lucide-react.tsx',
    '^@lib/whatsapp$': '<rootDir>/tests/__mocks__/whatsapp.ts',
    '^@lib/analytics$': '<rootDir>/tests/__mocks__/analytics.ts',
    '^server-only$': '<rootDir>/tests/__mocks__/server-only.ts',
    '^framer-motion$': '<rootDir>/tests/__mocks__/framer-motion.tsx',
    '^@heroicons/react/24/outline$': '<rootDir>/tests/__mocks__/heroicons.tsx',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.jest.json', isolatedModules: true },
    ],
  },
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Exclude Playwright tests - they should be run via pnpm test:e2e
    'tests/e2e/visitScheduling.e2e.test.ts',
    'tests/e2e/msw-e2e.test.ts',
    'tests/e2e/admin-login.spec.ts',
    // Exclude performance tests that use Playwright
    'tests/performance/visitScheduler.performance.test.ts',
  ],
};

export default config;


