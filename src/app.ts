import 'reflect-metadata';
import express from 'express';
import { orm } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { usuarioRouter } from './usuario/Usuario.routes.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api/usuarios', usuarioRouter);

app.use((_req, res) => {
  res.status(404).send({ message: 'Resource not found' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
