import express from 'express'
import { Usuario} from './usuario.js'

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

app.post('/api/usuarios', (req, res) => {
  const { name, esAdmin, estaActivo} = req.body
  const usuario = new Usuario (name, esAdmin, estaActivo )
  usuarios.push(usuario)
  res.status(201).send({message: 'Usuario creado', data: usuario})


})

app.put('/api/usuarios/:id', (req, res) => {
  const usuarioidx = usuarios.findIndex((usuario) => usuario.id === req.params.id)

  if (usuarioidx === -1) {
    res.status(404).send({message: 'Usuario no encontrado'})
  }
  const input = {
    name: req.body.name,
    esAdmin: req.body.esAdmin,
    estaActivo: req.body.estaActivo,
  }
  usuarios[usuarioidx] = {...usuarios[usuarioidx], ...input }

  res.status(200).send({message: 'Usuario actualizado correctamente', data: usuarios
    [usuarioidx]})
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000' )
}) 

