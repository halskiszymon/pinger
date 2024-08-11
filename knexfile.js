import config from './config.js';

export default {
  development: {
    client: 'mysql2',
    connection: {
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT,
      user: config.DATABASE_USER,
      password: config.DATABASE_PASS,
      database: config.DATABASE_NAME,
    },
    migrations: {
      directory: './database/migrations'
    }
  }
};