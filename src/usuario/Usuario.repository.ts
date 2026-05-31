import {Repository} from "../shared/repository.js"
import { Usuario } from "./Usuario.entity.js";
import {pool} from '../shared/db/conn.mysql.js'
 
export class usuarioRepository implements Repository<Usuario>{
  public async findAll(): Promise<Usuario[] | undefined> {
    const [usuarios] = await pool.query('SELECT * FROM usuarios')
    return usuarios as Usuario[]
  }

  public async findONE(item: { id: string }): Promise<Usuario | undefined> {
    throw new Error('not implemented')
  }

  public async add(item: Usuario): Promise<Usuario | undefined> {
    throw new Error ('not implemented')
  }

  public async update(id: string,item: Usuario): Promise<Usuario | undefined> {
    throw new Error('not implemented')
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
  