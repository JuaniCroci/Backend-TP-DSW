import {Repository} from "../shared/repository.js"
import { Usuario } from "./Usuario.entity.js";
import {pool} from '../shared/db/conn.mysql.js'
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
 
export class usuarioRepository implements Repository<Usuario>{
  public async findAll(): Promise<Usuario[] | undefined> {
    const [usuarios] = await pool.query('SELECT * FROM usuarios')
    return usuarios as Usuario[]
  }

  public async findONE(item: { id: string }): Promise<Usuario | undefined> {
    const rawId = item.id
    let params: any[]
    if (typeof rawId === 'string' && /^\d+$/.test(rawId)) {
      params = [Number.parseInt(rawId, 10)]
    } else {
      params = [rawId]
    }
    const [usuarios] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE id = ?', params)
    if (usuarios.length === 0) {
      return undefined
    }
    const usuario = usuarios[0] as Usuario
    return usuario
  }

  public async add(usuarioInput: Usuario): Promise<Usuario | undefined> {
    const {id, ...usuarioRow} = usuarioInput
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO usuarios set ?', [usuarioRow])
    usuarioInput.id = result.insertId
    return usuarioInput
  }

  public async update(id: string,usuarioInput: Usuario): Promise<Usuario | undefined> {
    const usuarioId = Number.parseInt(id)
    await pool.query('update usuarios set ? where id = ?',[usuarioInput, Number.parseInt(id)] )
    return usuarioInput

  }


  public async delete(item: { id: string }): Promise<Usuario | undefined> {  
    throw new Error('not implemented')
  }

}

/*const usuarios = [
  new Usuario(
    'Alpha',
    true,
    true,
    'cub45-328-777-0000-0000'

  ),
]
*/
  