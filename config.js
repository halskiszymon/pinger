import dotenv from 'dotenv';

dotenv.config();

// todo: add config validation

export default {
  APP_PORT: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3030,

  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
  DATABASE_NAME: process.env.DATABASE_NAME || '',
  DATABASE_USER: process.env.DATABASE_USER || '',
  DATABASE_PASS: process.env.DATABASE_PASS || '',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,

  COOKIES_DOMAIN: process.env.COOKIES_DOMAIN || 'localhost',
  COOKIES_HTTPONLY: process.env.COOKIES_HTTPONLY ? parseFloat(process.env.COOKIES_HTTPONLY) : true,
  COOKIES_SECURE: process.env.COOKIES_SECURE ? parseFloat(process.env.COOKIES_SECURE) : true,
  COOKIES_SAMESITE: process.env.COOKIES_SAMESITE,
  COOKIES_MAXAGE: process.env.COOKIES_MAXAGE ? parseInt(process.env.COOKIES_MAXAGE) * 60 * 1000 : null,
};