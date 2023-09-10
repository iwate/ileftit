import { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv'
dotenv.config({path: `.env.local`});

const config: PlaywrightTestConfig = {
    // use: {
    //     baseURL: "http://localhost:3000/"
    // },
    // webServer: {
    //     command: 'npm run start',
    //     port: 3000,
    //     timeout: 120 * 1000,
    //     reuseExistingServer: !process.env.CI,
    // },
};
export default config;