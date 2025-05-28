// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default [
  // Base JavaScript configuration
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },

  // TypeScript configuration with project reference
  {
    files: ["**/*.{ts,mts,cts}"],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        project: "./tsconfig.json", // Only apply to TypeScript files
      },
    },
  },

  // Apply TypeScript ESLint rules
  ...tseslint.configs.recommended,

  // Configuration files (keep as plain JS)
  {
    files: ["**/*.config.{js,mjs}", "eslint.config.mjs", "jest.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        // No project reference for config files
      },
    },
  },

  // Prettier configuration
  prettier,
  {
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Ignore patterns
  {
    ignores: ["node_modules/", "dist/", "coverage/", "**/*.d.ts"],
  },
];
