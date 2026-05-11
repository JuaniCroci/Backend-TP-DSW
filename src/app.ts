import express, { NextFunction, Request, Response } from 'express'
import { Usuario} from './usuario/Usuario.entity.js'
import { usuarioRepository } from './usuario/Usuario.repository.js'

const app = express()

app.use(express.json())

const repository = new usuarioRepository()

const usuarios = [
  new Usuario(
    'Alpha',
    true,
    true,
    'cub45-328-777-0000-0000'

  ),
]

app.get('/api/usuarios', (req, res) => {
  res.json({data: repository.findAll()})

})

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

app.get('/api/usuarios/:id', (req, res) => {
  const id = req.params.id
  const usuario = repository.findONE({id})
  if (!usuario) {
    return res.status(404).send({message: 'Usuario no encontrado'})
  }
  res.json({data: usuario})
})

app.post('/api/usuarios', sanitizeUsuarioInput, (req, res) => {
  const input = req.body.sanitizedInput

  const usuarioInput = new Usuario (input.name, input.esAdmin, input.estaActivo )
  const usuario = repository.add(usuarioInput)
  return res.status(201).send({message: 'Usuario creado', data: usuario})


})

app.put('/api/usuarios/:id', sanitizeUsuarioInput, (req, res) => {
  req.body.sanitizedInput.id = req.params.id
  const usuario =repository.update(req.body.sanitizedInput)

  if (!usuario) {
    return res.status(404).send({message: 'Usuario no encontrado'})
  }
 
  return res.status(200).send({message: 'Usuario actualizado correctamente', data: usuarios})
})


app.patch('/api/usuarios/:id', sanitizeUsuarioInput, (req, res) => {
  
  req.body.sanitizedInput.id = req.params.id
  const usuario =repository.update(req.body.sanitizedInput)

  if (!usuario) {
    return res.status(404).send({message: 'Usuario no encontrado'})
  }
 
  return res.status(200).send({message: 'Usuario actualizado correctamente', data: usuarios})
})

app.delete('/api/usuarios/:id', (req,res) => {
  const id = req.params.id
  const usuario =repository.delete({id})

  if (!usuario) {
    res.status(404).send({message: 'Usuario no encontrado'})
  } else {
    res.status(200).send({message: 'Usuario eliminado correctamente'})
  }
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000' )
}) 

