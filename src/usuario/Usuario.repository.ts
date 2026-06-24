import { EntityManager } from '@mikro-orm/mysql';
import { Usuario } from './Usuario.entity.js';

export class usuarioRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<Usuario[]> {
    return this.em.find(Usuario, {});
  }

  async findONE(item: { id: number }): Promise<Usuario | null> {
    return this.em.findOne(Usuario, item.id);
  }

  async add(usuarioInput: { name: string; esAdmin: boolean; estaActivo: boolean }): Promise<Usuario> {
    const usuario = this.em.create(Usuario, usuarioInput);
    await this.em.persist(usuario).flush();
    return usuario;
  }

  async update(id: number, usuarioInput: { name?: string; esAdmin?: boolean; estaActivo?: boolean }): Promise<Usuario | null> {
    const usuario = await this.em.findOne(Usuario, id);
    if (!usuario) return null;
    this.em.assign(usuario, usuarioInput);
    await this.em.flush();
    return usuario;
  }

  async delete(item: { id: number }): Promise<Usuario | null> {
    const usuario = await this.em.findOne(Usuario, item.id);
    if (!usuario) return null;
    await this.em.remove(usuario).flush();
    return usuario;
  }
}
