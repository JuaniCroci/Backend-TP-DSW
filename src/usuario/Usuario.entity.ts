import { Entity, Property } from '@mikro-orm/decorators/legacy';
import { BaseEntity } from '../shared/db/baseEntity.entity';

@Entity()
export class Usuario extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  esAdmin!: boolean;

  @Property()
  estaActivo!: boolean;
}
