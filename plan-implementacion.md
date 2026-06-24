# Plan: Migrar de mysql2 raw a MikroORM + Podman

> Basado en `guia-instalacion-podman-mysql-mikroorm.md`
> Tu proyecto usa ESM (`"type": "module"`, `"module": "ES2022"`, imports con `.js`)

---

## Paso 1 — Crear `docker-compose.yml`

Crear en la raíz del proyecto (`./docker-compose.yml`):

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: backend_tp_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

> El volumen `mysql_data` hace que los datos sobrevivan aunque borres el contenedor.

---

## Paso 2 — Crear `.env` y `.env.example`

### `.env` (no se sube al repo)

Crear en la raíz:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=entreno2
DB_USER=dsw
DB_PASSWORD=dsw
```

### `.env.example` (se comparte con el equipo)

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

> Verificá que `.env` ya está en `.gitignore` (ya lo está ✅).

---

## Paso 3 — Crear `src/mikro-orm.config.ts`

Crear `src/mikro-orm.config.ts`:

```typescript
import { defineConfig } from '@mikro-orm/mysql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import 'dotenv/config';

export default defineConfig({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  dbName:   process.env.DB_NAME     || 'entreno2',
  user:     process.env.DB_USER     || 'dsw',
  password: process.env.DB_PASSWORD || 'dsw',

  entities:   ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],

  metadataProvider: TsMorphMetadataProvider,

  migrations: {
    path: './src/migrations',
  },

  debug: process.env.NODE_ENV !== 'production',
});
```

> Usa `./dist/**/*.entity.js` porque trabajás con ESM y los archivos compilados terminan en `.js` dentro de `dist/`.
> Los paths son genéricos (`**/*.entity.*`) para no tener que tocar la config cada vez que agregues una entidad, sin importar en qué carpeta esté.

Luego crear la carpeta de migraciones:

```powershell
mkdir src\migrations
```

---

## Paso 4 — Actualizar `package.json`

Agregar al final del archivo (después del último `}`):

```json
  "mikro-orm": {
    "useTsNode": true,
    "configPaths": ["./src/mikro-orm.config.ts"]
  }
```

Y agregar estos scripts dentro de `"scripts"`:

```json
    "migration:create": "mikro-orm migration:create",
    "migration:up":     "mikro-orm migration:up",
    "migration:down":   "mikro-orm migration:down"
```

> Ojo con las comas: el último script dentro de `"scripts"` **no lleva coma**; el que le sigue sí.

---

## Paso 5 — Convertir `src/usuario/Usuario.entity.ts`

**Antes** (clase plana):

```typescript
import crypto from 'node:crypto'
export class Usuario {
  constructor(
    public name: string,
    public esAdmin: boolean,
    public estaActivo: boolean,
    public id?: string | number
  ) {}
}
```

**Después** (entidad MikroORM):

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

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
```

Cambios clave:
- Se reemplaza `crypto` por decoradores de MikroORM
- `id` pasa de `string | number` opcional a `number` obligatorio (autoincremental)
- Se elimina el constructor (MikroORM lo maneja internamente)
- Cada propiedad se marca con `@Property()` → será una columna en MySQL

---

## Paso 6 — Refactorizar `src/usuario/Usuario.repository.ts`

**Antes** (mysql2 raw, recibe datos planos):

```typescript
import {Repository} from "../shared/repository.js"
import { Usuario } from "./Usuario.entity.js";
import {pool} from '../shared/db/conn.mysql.js'
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export class usuarioRepository implements Repository<Usuario>{
  public async findAll(): Promise<Usuario[] | undefined> {
    const [usuarios] = await pool.query('SELECT * FROM usuarios')
    return usuarios as Usuario[]
  }
  // ... más métodos con SQL crudo
}
```

**Después** (EntityManager de MikroORM):

```typescript
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
    await this.em.persistAndFlush(usuario);
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
    await this.em.removeAndFlush(usuario);
    return usuario;
  }
}
```

Cambios clave:
- Ya no implementa `Repository<T>` (podés borrar `src/shared/repository.ts` después)
- Recibe `EntityManager` por constructor (se lo va a pasar desde `app.ts`)
- `findONE` y `delete` reciben `{ id: number }` en vez de `{ id: string }`
- `update` usa `this.em.assign()` para mergear cambios parciales
- No tira errores con `throw`, devuelve `null` si no encuentra (importante para el controlador)

---

## Paso 7 — Actualizar `src/app.ts`

**Antes** (sin MikroORM):

```typescript
import 'dotenv/config'
import express from 'express'
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
  console.log('Server is running on http://localhost:3000')
})
```

**Después** (con inicialización de MikroORM):

```typescript
import 'dotenv/config'
import express from 'express'
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config.js';
import { usuarioRouter } from './usuario/Usuario.routes.js'
import { usuarioRepository } from './usuario/Usuario.repository.js';

async function main() {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const em = orm.em.fork();
  const repo = new usuarioRepository(em);

  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.usuarioRepo = repo;
    next();
  });

  app.use('/api/usuarios', usuarioRouter);

  app.use((_req, res) => {
    res.status(404).send({ message: 'Resource not found' });
  });

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

main().catch(console.error);
```

> La app ahora arranca dentro de un `async function main()`.
> MikroORM se inicializa y se corre `getMigrator().up()` para aplicar migraciones automáticamente al iniciar.
> El repositorio se crea con el `EntityManager` y se guarda en `req` para que los controladores lo usen.

---

## Paso 8 — Actualizar `Usuario.controller.ts`

Cada controlador necesita obtener el repositorio desde `req`:

```typescript
import { Request, Response, NextFunction } from 'express'
import { usuarioRepository } from './Usuario.repository.js'

function getRepo(req: Request): usuarioRepository {
  return (req as any).usuarioRepo;
}

function sanitizeUsuarioInput(req: Request, _res: Response, next: NextFunction) {
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
  const data = await getRepo(req).findAll();
  res.json({ data });
}

async function findONE(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).findONE({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  res.json({ data: usuario });
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const usuario = await getRepo(req).add(input);
  return res.status(201).send({ message: 'Usuario creado', data: usuario });
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).update(id, req.body.sanitizedInput);
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  return res.status(200).send({ message: 'Usuario actualizado', data: usuario });
}

async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ message: 'ID inválido' });
  }
  const usuario = await getRepo(req).delete({ id });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuario no encontrado' });
  }
  return res.status(200).send({ message: 'Usuario eliminado correctamente' });
}

export { sanitizeUsuarioInput, findAll, findONE, add, update, remove }
```

Cambios clave:
- Los parámetros `id` se convierten a número (`Number(req.params.id)`)
- Se valida que el ID sea numérico
- El repositorio se obtiene desde `req` (viene del middleware en `app.ts`)
- Se maneja el caso `null` (MikroORM devuelve `null`, no `undefined`)

---

## Paso 9 — Eliminar archivos que ya no se usan

```powershell
del src\shared\repository.ts
```

El archivo `src\shared\db\conn.mysql.ts` ya no se necesita (MikroORM maneja la conexión), podés borrarlo también:

```powershell
del src\shared\db\conn.mysql.ts
rmdir src\shared\db
```

---

## Paso 10 — Crear migración inicial y probar

```powershell
# 1. Pararte en la raíz del proyecto
# 2. Iniciar MySQL en Podman
podman compose up -d

# 3. Crear la migración (genera el archivo en src/migrations/)
npm run migration:create

# 4. Aplicar la migración (crea la tabla usuarios en MySQL)
npm run migration:up

# 5. Compilar y arrancar la app
npm run start:dev
```

> Si `npm run start:dev` da error, probá primero con:
> ```powershell
> npx tsc
> node dist/app.js
> ```

---

## Resumen de archivos a crear (4)

| Archivo | Contenido |
|---|---|
| `docker-compose.yml` | Servicio MySQL 8.0 |
| `.env` | Variables de conexión |
| `.env.example` | Template sin valores |
| `src/mikro-orm.config.ts` | Config de MikroORM |

## Resumen de archivos a modificar (4)

| Archivo | Cambio |
|---|---|
| `package.json` | Agregar sección `mikro-orm` y 3 scripts |
| `src/usuario/Usuario.entity.ts` | Decoradores `@Entity`, `@PrimaryKey`, `@Property` |
| `src/usuario/Usuario.repository.ts` | Usar `EntityManager` en vez de mysql2 raw |
| `src/app.ts` | Inicializar MikroORM y pasar `EntityManager` |
| `src/usuario/Usuario.controller.ts` | Obtener repo desde `req`, IDs numéricos |

## Archivos a eliminar (2)

| Archivo | Motivo |
|---|---|
| `src/shared/repository.ts` | Reemplazado por métodos de MikroORM |
| `src/shared/db/conn.mysql.ts` | Reemplazado por la config de MikroORM |
