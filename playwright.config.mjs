import {defineConfig} from '@playwright/test';
const port=Number(process.env.PIXEL_CAT_BROWSER_PORT||8774);
export default defineConfig({
 testDir:'./tests/browser',testMatch:'**/*.spec.mjs',fullyParallel:false,workers:1,forbidOnly:!!process.env.CI,retries:0,timeout:30000,globalTimeout:180000,
 outputDir:'.test-artifacts/browser/results',reporter:[['list'],['html',{outputFolder:'.test-artifacts/browser/report',open:'never'}]],
 use:{browserName:'chromium',baseURL:'http://127.0.0.1:'+port,trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'desktop',use:{viewport:{width:1100,height:850}}},{name:'narrow',use:{viewport:{width:480,height:850}}}],
 globalSetup:'./scripts/browser/setup.mjs'
});
