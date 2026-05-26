import express, { NextFunction, Request, Response } from 'express'
import { Usuario} from './usuario/Usuario.entity.js'
import { usuarioRepository } from './usuario/Usuario.repository.js'
import { usuarioRouter } from './usuario/Usuario.routes.js'

const app = express()

app.use(express.json())

app.use('/api/usuarios', usuarioRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000' )
}) 

