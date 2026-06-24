import { Request, Response, NextFunction } from 'express'
import { usuarioRepository } from './Usuario.repository.js'

function getRepo(req: Request): usuarioRepository {
  return (req as any).usuarioRepo;
}

function sanitizeUsuarioInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    esAdmin: req.body.esAdmin,
    estaActivo: req.body.estaActivo,
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  const data = await getRepo(req).findAll();
  res.json({ data });
}

async function findONE(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).findONE({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  res.json({ data: usuario });
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const usuario = await getRepo(req).add(input);
  return res.status(201).send({ message: 'Usuario creado', data: usuario });
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).update(id, req.body.sanitizedInput);
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  return res.status(200).send({ message: 'Usuario actualizado', data: usuario });
}

async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).delete({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  return res.status(200).send({ message: 'Usuario eliminado correctamente' });
}

export { sanitizeUsuarioInput, findAll, findONE, add, update, remove }
