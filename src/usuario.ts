import crypto from 'node:crypto'
export class Usuario {
  constructor(
    public name: string,
    public esAdmin: boolean,
    public estaActivo: boolean,
    public id= crypto.randomUUID()

  ){}
}