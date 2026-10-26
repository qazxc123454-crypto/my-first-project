const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "http-server . -a 127.0.0.1 -p 4173 -c-1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
