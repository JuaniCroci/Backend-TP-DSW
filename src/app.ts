import express, { NextFunction, Request, Response } from 'express'
import { Usuario} from './usuario/Usuario.entity.js'

const app = express()

app.use(express.json())

const usuarios = [
  new Usuario(
    'Alpha',
    true,
    true,
    'cub45-328-777-0000-0000'

  ),
]


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

app.get('/api/usuarios', (req, res) => {
  res.json({data: usuarios})

})


app.get('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find((usuario) => usuario.id === req.params.id)
  if (!usuario) {
    res.status(404).send({message: 'Usuario no encontrado'})
  }
  res.json({data: usuario})
})

app.post('/api/usuarios', sanitizeUsuarioInput, (req, res) => {
  const input = req.body.sanitizedInput
  const usuario = new Usuario (input.name, input.esAdmin, input.estaActivo )
  usuarios.push(usuario)
  res.status(201).send({message: 'Usuario creado', data: usuario})


})

app.put('/api/usuarios/:id', sanitizeUsuarioInput, (req, res) => {
  const usuarioidx = usuarios.findIndex((usuario) => usuario.id === req.params.id)

  if (usuarioidx === -1) {
    res.status(404).send({message: 'Usuario no encontrado'})
  }
 
  usuarios[usuarioidx] = {...usuarios[usuarioidx], ...req.body.sanitizedInput }

  res.status(200).send({message: 'Usuario actualizado correctamente', data: usuarios
    [usuarioidx]})
})


app.patch('/api/usuarios/:id', sanitizeUsuarioInput, (req, res) => {
  const usuarioidx = usuarios.findIndex((usuario) => usuario.id === req.params.id)

  if (usuarioidx === -1) {
    res.status(404).send({message: 'Usuario no encontrado'})
  }
 
  usuarios[usuarioidx] = {...usuarios[usuarioidx], ...req.body.sanitizedInput }

  res.status(200).send({message: 'Usuario actualizado correctamente', data: usuarios
    [usuarioidx]})
})

app.delete('/api/usuarios/:id',(req, res) => {
  const usuarioidx = usuarios.findIndex((usuario) => usuario.id === req.params.id)

  if (usuarioidx === -1) {
    res.status(404).send({message: 'Usuario no encontrado'})
  } else {
      usuarios.splice(usuarioidx, 1)
      res.status(200).send({message: 'Usuario eliminado correctamente'})
    }
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000' )
}) 

