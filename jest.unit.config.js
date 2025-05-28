module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/unit/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
