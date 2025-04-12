/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // Use ESM preset for ts-jest
  testEnvironment: 'node', // Or 'jsdom' if testing browser-specific features like entropy listeners
  moduleNameMapper: {
    // Handle module name mapping if necessary, especially for ESM
    // Example: '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // Tell ts-jest to use ESM
        tsconfig: 'tsconfig.json', // Ensure it uses the correct tsconfig
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  // Add coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // or 'babel'
  coverageReporters: ["json", "text", "lcov", "clover"],
  // Specify files to include in coverage report
  collectCoverageFrom: [
    "lib/**/*.ts", // Include all files in lib
    "index.ts",    // Include the main index file
    "!lib/entropy.ts", // Exclude entropy for now as it relies on browser APIs
    "!**/*.d.ts"   // Exclude declaration files
  ],
};