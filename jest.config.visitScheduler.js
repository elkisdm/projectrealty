const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    setupFiles: ['<rootDir>/tests/setup-polyfills.ts'],
    testEnvironment: 'jsdom',
    // Configuración específica para Next.js
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
    testMatch: [
        '<rootDir>/tests/**/*.test.{ts,tsx}',
        '<rootDir>/tests/**/*.spec.{ts,tsx}'
    ],
    collectCoverageFrom: [
        'components/flow/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'app/api/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        './components/flow/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        './hooks/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@components/(.*)$': '<rootDir>/components/$1',
        '^@hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@lib/(.*)$': '<rootDir>/lib/$1',
        '^@types/(.*)$': '<rootDir>/types/$1',
        '^@data/(.*)$': '<rootDir>/data/$1',
        '^@schemas/(.*)$': '<rootDir>/schemas/$1',
        // Mocks para librerías externas
        '^lucide-react$': '<rootDir>/tests/__mocks__/lucide-react.tsx',
        '^@lib/whatsapp$': '<rootDir>/tests/__mocks__/whatsapp.ts',
        '^@lib/analytics$': '<rootDir>/tests/__mocks__/analytics.ts',
        '^server-only$': '<rootDir>/tests/__mocks__/server-only.ts',
        '^framer-motion$': '<rootDir>/tests/__mocks__/framer-motion.tsx',
        '^@heroicons/react/24/outline$': '<rootDir>/tests/__mocks__/heroicons.tsx',
    },
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    transformIgnorePatterns: [
        '/node_modules/',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/tests/e2e/',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    verbose: true,
    testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
