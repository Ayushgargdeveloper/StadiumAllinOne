import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
    }
  },
  {
    files: ["api/**/*.ts", "server/**/*.ts", "src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "src/test/**"],
    rules: {
      complexity: ["error", 8],
      "max-depth": ["error", 3],
      "max-lines": ["error", 200],
      "max-lines-per-function": ["error", 60],
      "max-params": ["error", 4],
      "no-console": "error",
      "no-duplicate-imports": "error",
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack"], location: "anywhere" }]
    }
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/api/**", "**/server/**"],
              message: "Browser code must access server behavior through the HTTP client boundary."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["server/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/features/**"],
              message: "Server modules may depend on shared domain code, never browser features."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/api/**", "**/features/**", "**/server/**"],
              message: "Shared modules must remain platform-neutral and independent of feature UI."
            }
          ]
        }
      ]
    }
  }
);
