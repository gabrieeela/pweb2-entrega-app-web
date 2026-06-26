const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.js',
  outputDir: 'C:/Temp/playwright-output', 
  timeout: 15000,
  retries: 1,

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
  },
});