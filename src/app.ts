import express from 'express'
import { Usuario} from './usuario.js'

const app = express()

const usuarios = [
  new Usuario(
    'Alpha',
    true,
    true,
    'cub45-328-777-0000-0000'

  ),
]

app.get('/api/usuarios', (req, res) => {
  res.json(usuarios)

})

app.get('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find((usuario) => usuario.id === req.params.id)
  if (!usuario) {
    res.status(404).send({message: 'Usuario no encontrado'})
  }
  res.json(usuario)
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000' )
}) 

