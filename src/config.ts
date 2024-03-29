import * as dotenv from 'dotenv';
dotenv.config();

export const DEBUG = process.env.DEBUG ? /true/i.test(process.env.DEBUG) : false;

export const PORT = 6005;

export const googleMapAPI = process.env.GOOGLE_MAP_API;

// Database Parameters
export const dbSchema = process.env.DATABASE_SCHEMA;
export const dbUsername = process.env.DATABASE_USERNAME;
export const dbPassword = process.env.DATABASE_PASSWORD;
export const dbHost = process.env.DATABASE_HOST;

export const USERS_API_HOST = process.env.USERS_API_HOST || "http://localhost:6001";
