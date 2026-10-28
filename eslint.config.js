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
      "playwright.config.js",
      "e2e/**/*.js",
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
