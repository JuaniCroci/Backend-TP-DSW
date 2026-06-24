# Plan de implementación — Alineado con la cátedra (material-be)

> Basado en el ejemplo oficial `05.05-express-api-mikroorm` del repositorio
> [utnfrrodsw/material-be](https://github.com/utnfrrodsw/material-be)
>
> **Objetivo:** Migrar de mysql2 raw a MikroORM v7 siguiendo la arquitectura de la cátedra.
> **Stack actual:** TypeScript (ESM), Express 5, MikroORM v7.1.4, MySQL 8.0 (Podman/Docker)

---

## Diferencias claves entre la cátedra (v5) y nuestra versión (v7)

| Concepto | Cátedra (MikroORM v5) | Nosotros (MikroORM v7) |
|---|---|---|
| Decoradores | `@mikro-orm/core` | `@mikro-orm/decorators/legacy` |
| Schema sync | `orm.getSchemaGenerator().updateSchema()` | `orm.schema.update()` |
| Delete | `em.removeAndFlush(ref)` | `em.remove(ref).flush()` |
| Migrator | `orm.getMigrator()` | `orm.migrator` (propiedad) |

---

## Dependencias a instalar

```powershell
pnpm add reflect-metadata @mikro-orm/sql-highlighter
```

---

## Archivos a ELIMINAR (4)

| Archivo | Motivo |
|---|---|
| `src/mikro-orm.config.ts` | La configuración del ORM va en `src/shared/db/orm.ts` |
| `src/usuario/Usuario.repository.ts` | La cátedra no usa repositorio — el controller usa `orm.em` directo |
| `src/shared/repository.ts` | Ya no se usa (era la interfaz genérica de repositorio) |
| `src/shared/db/conn.mysql.ts` | Ya no se usa (era la conexión raw de mysql2) |

---

## Archivos a CREAR (2)

### 1. `src/shared/db/baseEntity.entity.ts`

Entidad base abstracta con el primary key compartido por todas las entidades.

```typescript
import { PrimaryKey } from '@mikro-orm/decorators/legacy'

export abstract class BaseEntity {
  @PrimaryKey()
  id?: number
}
```

### 2. `src/shared/db/orm.ts`

Inicialización de MikroORM y función `syncSchema` para mantener el schema actualizado automáticamente (solo para desarrollo — `// never in production`).

```typescript
import { MikroORM } from '@mikro-orm/mysql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: process.env.DB_NAME || 'entreno2',
  clientUrl: `mysql://${process.env.DB_USER || 'dsw'}:${process.env.DB_PASSWORD || 'dsw'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'entreno2'}`,
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
```

---

## Archivos a MODIFICAR (3)

### 3. `src/usuario/Usuario.entity.ts`

La entidad extiende `BaseEntity` y usa decoradores de `@mikro-orm/decorators/legacy`. Las propiedades se marcan con `{ nullable: false }` como en el ejemplo oficial.

```typescript
import { Entity, Property } from '@mikro-orm/decorators/legacy'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  name!: string

  @Property({ nullable: false })
  esAdmin!: boolean

  @Property({ nullable: false })
  estaActivo!: boolean
}
```

### 4. `src/app.ts`

Se reemplaza completamente para seguir la estructura del ejemplo oficial:
- `import 'reflect-metadata'` al inicio (requerido para decoradores legacy)
- Middleware `RequestContext.create(orm.em, next)` para identity map por request
- Llamada a `await syncSchema()` al arrancar (solo desarrollo)
- Sin init manual de MikroORM (todo en `orm.ts`)

```typescript
import 'reflect-metadata'
import express from 'express'
import { usuarioRouter } from './usuario/Usuario.routes.js'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use('/api/usuarios', usuarioRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

await syncSchema()

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### 5. `src/usuario/Usuario.controller.ts`

Se reemplaza completamente siguiendo el patrón del ejemplo oficial:
- Usa `const em = orm.em` directamente (sin repositorio, sin middleware de inyección)
- Cada método envuelto en `try/catch` con `res.status(500).json({ message: error.message })`
- `findONE` usa `em.findOneOrFail()` en vez de null check manual
- `remove` usa `em.getReference()` en vez de `findOne` (más eficiente)
- IDs se convierten con `Number.parseInt()` (como en la cátedra)

```typescript
import { Request, Response, NextFunction } from 'express'
import { Usuario } from './Usuario.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    esAdmin: req.body.esAdmin,
    estaActivo: req.body.estaActivo,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {})
    res.status(200).json({ message: 'found all usuarios', data: usuarios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findONE(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, { id })
    res.status(200).json({ message: 'found usuario', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'usuario created', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, { id })
    em.assign(usuario, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'usuario updated', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = em.getReference(Usuario, id)
    await em.remove(usuario).flush()
    res.status(200).send({ message: 'usuario deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeUsuarioInput, findAll, findONE, add, update, remove }
```

---

## Archivos que NO se modifican (5)

| Archivo | Motivo |
|---|---|
| `src/usuario/Usuario.routes.ts` | Ya coincide con el patrón de la cátedra |
| `tsconfig.json` | Ya tiene `experimentalDecorators: true` y `emitDecoratorMetadata: true` |
| `.env` | Ya tiene las variables de entorno configuradas |
| `package.json` | Los scripts están bien; solo se agregan dependencias |
| `docker-compose.yml` | Ya creado correctamente |

---

## Orden de ejecución

```
1. pnpm add reflect-metadata @mikro-orm/sql-highlighter
2. Crear src/shared/db/baseEntity.entity.ts
3. Crear src/shared/db/orm.ts
4. Eliminar src/mikro-orm.config.ts
5. Eliminar src/usuario/Usuario.repository.ts
6. Eliminar src/shared/repository.ts
7. Eliminar src/shared/db/conn.mysql.ts
8. Modificar src/usuario/Usuario.entity.ts (extender BaseEntity)
9. Modificar src/app.ts (reflect-metadata, RequestContext, syncSchema)
10. Modificar src/usuario/Usuario.controller.ts (orm.em directo, try/catch)
11. Compilar y verificar: npx tsc --noEmit
12. Probar: podman compose up -d, npm run build, node dist/app.js
```

---

## Resumen final

| Tipo | Cantidad |
|---|---|
| Dependencias a instalar | 2 (`reflect-metadata`, `@mikro-orm/sql-highlighter`) |
| Archivos a eliminar | 4 |
| Archivos a crear | 2 |
| Archivos a modificar | 3 |
| Archivos sin cambios | 5 |
