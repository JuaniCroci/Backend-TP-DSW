import 'dotenv/config'
import express from 'express'
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config.js';
import { usuarioRouter } from './usuario/Usuario.routes.js'
import { usuarioRepository } from './usuario/Usuario.repository.js';

async function main() {
  const orm = await MikroORM.init(config);
  await orm.migrator.up();

  const em = orm.em.fork();
  const repo = new usuarioRepository(em);

  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    (req as any).usuarioRepo = repo;
    next();
  });

  app.use('/api/usuarios', usuarioRouter);

  app.use((_req, res) => {
    res.status(404).send({ message: 'Resource not found' });
  });

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

main().catch(console.error);
