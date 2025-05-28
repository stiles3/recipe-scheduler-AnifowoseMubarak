module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.ts"], // Changed test to tests
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  globalSetup: "<rootDir>/tests/integration/setup.ts", // Changed test to tests
  globalTeardown: "<rootDir>/tests/integration/teardown.ts", // Changed test to tests
  modulePaths: ["<rootDir>"],
  moduleDirectories: ["node_modules", "src"],
  testTimeout: 30000,
};
