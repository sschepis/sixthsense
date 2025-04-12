// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Extends recommended configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Use type-checked rules

  // Configuration for TypeScript files
  {
    languageOptions: {
      parserOptions: {
        project: true, // Automatically find tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Set root for tsconfig discovery
      },
    },
    rules: {
      // Add specific rule overrides here
      // Example: Allow unused vars prefixed with underscore (already handled by recommended-type-checked potentially, but explicit is fine)
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      // Allow 'any' type for now, can be tightened later
      '@typescript-eslint/no-explicit-any': 'warn',
      // Add other rules as needed
    },
  },

  // Ignore patterns
  {
    ignores: [
        "dist/",
        "node_modules/",
        "eslint.config.js" // Ignore this config file itself
        ],
  }
);