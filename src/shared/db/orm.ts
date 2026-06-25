import { MikroORM } from '@mikro-orm/mysql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'entreno2',
  clientUrl: 'mysql://dsw:dsw@localhost:3306/entreno2',
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
})

export const syncSchema = async () => {
  await orm.schema.update()
}

// el getSchemaGenerator() es un metodo viejo, ahora con la ultima version de mikro-orm se usa orm.schema.update() para actualizar el esquema de la base de datos
