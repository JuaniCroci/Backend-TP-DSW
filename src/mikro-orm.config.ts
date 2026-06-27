import { defineConfig, Options } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import 'dotenv/config';

const config: Options = defineConfig({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  dbName:   process.env.DB_NAME     || 'entreno2',
  user:     process.env.DB_USER     || 'dsw',
  password: process.env.DB_PASSWORD || 'dsw',

  entities:   ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],

  metadataProvider: TsMorphMetadataProvider,

  migrations: {
    path: './src/migrations',
  },

  debug: process.env.NODE_ENV !== 'production',
});

export default config;
