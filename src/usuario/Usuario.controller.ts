import {Request, Response, NextFunction} from "express"
import { usuarioRepository } from "./Usuario.repository.js"
import { Usuario } from "./Usuario.entity.js"
const repository = new usuarioRepository()

function sanitizeUsuarioInput(req: Request, res: Response, next: Function) {

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
  res.json({ data: await repository.findAll()})
}

async function findONE(req: Request, res: Response) {
  const id = req.params.id as string
  const usuario = await repository.findONE({id})
  if (!usuario) {
    return res.status(404).send({message: 'Usuario no encontrado'})
  }
  res.json({data: usuario})
}


async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const usuarioInput = new Usuario (input.name, input.esAdmin, input.estaActivo )
  const usuario = await repository.add(usuarioInput)
  return res.status(201).send({message: 'Usuario creado', data: usuario})


}

async function update (req: Request, res: Response) {
  const id = req.params.id as string
  const usuario = await repository.update(id, req.body.sanitizedInput as Usuario)
  
  if (!usuario) {
    return res.status(404).send({message: 'Usuario no encontrado'})
  }
 
  return res.status(200).send({message: 'Usuario actualizado correctamente', data: usuario})
}

async function remove(req: Request, res: Response) {
  const id = req.params.id as string
  const usuario =await repository.delete({id})

  if (!usuario) {
    res.status(404).send({message: 'Usuario no encontrado'})
  } else {
    res.status(200).send({message: 'Usuario eliminado correctamente'})
  }
}


export {sanitizeUsuarioInput, findAll, findONE, add, update, remove}

