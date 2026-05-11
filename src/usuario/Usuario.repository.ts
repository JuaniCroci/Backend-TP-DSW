import {Repository} from "../shared/repository.js"
import { Usuario } from "./Usuario.entity.js";


const usuarios = [
  new Usuario(
    'Alpha',
    true,
    true,
    'cub45-328-777-0000-0000'

  ),
]

export class usuarioRepository implements Repository<Usuario>{

  public findAll(): Usuario[] | undefined {
    return usuarios
  }

  public findONE(item: { id: string }): Usuario | undefined {
    return usuarios.find((usuario) => usuario.id === item.id)
  }

  public add(item: Usuario): Usuario | undefined {
    usuarios.push(item)
    return item
  }

  public update(item: Usuario): Usuario | undefined {
   const usuarioidx = usuarios.findIndex((usuario) => usuario.id === item.id)

    if (usuarioidx !== -1) {
      usuarios[usuarioidx] = {...usuarios[usuarioidx], ...item}
    }
    return usuarios[usuarioidx]
  }
  public delete(item: { id: string }): Usuario | undefined {  
    const usuarioidx = usuarios.findIndex((usuario) => usuario.id === item.id)
    if (usuarioidx !== -1) {
      const deletedUsuario = usuarios[usuarioidx]
      usuarios.splice(usuarioidx, 1)
      return deletedUsuario
    }
  }

}