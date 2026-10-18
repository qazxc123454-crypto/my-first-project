module.exports = [
  {
    files: ["script.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  {
    files: ["hello-node.js", "eslint.config.js"],
    languageOptions: {
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
