module.exports = [
  {
    ignores: ["playwright-report/**", "test-results/**"],
  },
  {
    files: ["script.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        countUnfinishedTodos: "readonly",
        filterTodos: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  {
    files: [
      "hello-node.js",
      "eslint.config.js",
      "todo-utils.js",
      "tests/todo-utils.test.js",
      "tests/asset-versions.test.js",
      "scripts/sync-asset-versions.js",
      "playwright.config.js",
      "e2e/**/*.js",
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
