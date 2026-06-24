import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity()
export class Usuario {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  esAdmin!: boolean;

  @Property()
  estaActivo!: boolean;
}
