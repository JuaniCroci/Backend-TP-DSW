# Cómo levantar el proyecto (paso a paso)

> Usás **Podman** o **Docker** → los comandos son casi idénticos.
> Donde dice `podman` los de Docker usan `docker`.

---

## Requisitos previos

**Si usás Podman (Windows):**
1. Instalar [Podman Desktop](https://podman-desktop.io)
2. Abrirlo e inicializar la VM (botón **Initialize** → **Start**)
3. Ir a **Extensions** → instalar **Compose**
4. Verificar en PowerShell:
   ```powershell
   podman --version           # 5.x.x
   podman compose version     # debe mostrar versión
   ```

**Si usás Docker (Windows/Mac/Linux):**
1. Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Abrirlo (esperar a que el motor inicie)
3. Verificar en terminal:
   ```powershell
   docker --version           # 24.x.x o superior
   docker compose version     # debe mostrar versión
   ```

**Todos:**
- Node.js v20+ y pnpm instalados:
  ```powershell
  pnpm --version
  ```

---

## Primera vez (solo una vez en toda la vida del proyecto)

### 1. Instalar dependencias
```powershell
pnpm install
```

### 2. Elegir tu herramienta y levantar MySQL

**Si usás Podman:**
```powershell
podman compose up -d
```

**Si usás Docker:**
```powershell
docker compose up -d
```

> Esto descarga la imagen `mysql:8.0`, crea el contenedor `backend_tp_mysql` y lo inicia en segundo plano.
> Esperar unos **30 segundos** a que MySQL termine de inicializar (sobre todo la primera vez).

### 3. Verificar que MySQL está corriendo

**Podman:** `podman ps`
**Docker:** `docker ps`

Debería aparecer `backend_tp_mysql` con estado `Up`.

| Container ID | Image | Command | Created | Status | Ports |
|---|---|---|---|---|---|
| abc... | mysql:8.0 | mysqld | ... | Up 1 min | 0.0.0.0:3307->3306/tcp |

### 4. Crear la migración inicial
```powershell
pnpm run migration:create
```
Genera un archivo en `src/migrations/` con la estructura de la tabla `usuario`.

### 5. Aplicar la migración
```powershell
pnpm run migration:up
```
Ejecuta el SQL y crea la tabla en la base `entreno2`.

### 6. Compilar TypeScript
```powershell
npx tsc
```

### 7. Arrancar la app
```powershell
node dist/app.js
```
Deberías ver:
```
Server running on http://localhost:3000
```

---

## Día siguiente (cuando volvés a trabajar)

```powershell
# 1. Abrir Podman Desktop / Docker Desktop (VM corriendo)

# 2. Levantar MySQL
podman compose up -d        # o: docker compose up -d

# 3. Si un compañero subió nuevas migraciones
pnpm run migration:up

# 4. Compilar y arrancar
npx tsc && node dist/app.js
```

> **Nota para Podman:** Si al volver te da error de conexión (`unable to connect to Podman socket`),
> la VM quedó en un estado inconsistente. Solución:
> ```powershell
> podman machine stop
> podman machine start
> podman start backend_tp_mysql
> ```
> Después ya podés continuar con `node dist/app.js`.

---

## Comandos útiles

| Acción | Podman | Docker |
|---|---|---|
| Ver contenedores activos | `podman ps` | `docker ps` |
| Ver logs de MySQL | `podman logs backend_tp_mysql` | `docker logs backend_tp_mysql` |
| Entrar a consola MySQL | `podman exec -it backend_tp_mysql mysql -u root -pdsw` | `docker exec -it backend_tp_mysql mysql -u root -pdsw` |
| Detener MySQL (conserva datos) | `podman compose stop` | `docker compose stop` |
| Detener y borrar datos (¡cuidado!) | `podman compose down -v` | `docker compose down -v` |
| Bajar contenedor (conserva datos) | `podman compose down` | `docker compose down` |

---

## Puertos y conexión

El proyecto usa el puerto **3307** para evitar conflictos con otros MySQL que puedas tener instalados.

| Variable | Valor |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3307` |
| `DB_NAME` | `entreno2` |
| `DB_USER` | `dsw` |
| `DB_PASSWORD` | `dsw` |

> Si querés usar el puerto `3306` estándar, cambialo en `docker-compose.yml` y `.env`.

---

## Solución de problemas

### `Access denied for user 'dsw'@'localhost'`
**Causa:** Tenés MySQL instalado localmente en el puerto `3306`.
**Solución:** El proyecto ya usa el puerto `3307` para evitarlo.
Verificá que `.env` tenga `DB_PORT=3307` y `docker-compose.yml` tenga `"3307:3306"`.

Si el problema persiste, detené el servicio local:
```powershell
# PowerShell como Administrador
net stop MySQL80
```

### `port is already allocated`
El puerto `3307` también está ocupado.
Cambiá a otro puerto (ej: `3308`) en:
- `docker-compose.yml`: `"3308:3306"`
- `.env`: `DB_PORT=3308`

### `SyntaxError: Invalid or unexpected token`
Falta `tsx`. Instalarlo:
```powershell
pnpm add -D tsx
```

### `Cannot find package 'reflect-metadata'`
```powershell
pnpm add reflect-metadata
```

### Archivos compilados faltan en `dist/`
Borrar el caché de compilación y recompilar:
```powershell
Remove-Item tsconfig.tsbuildinfo -Force
npx tsc
```

### Podman: `unable to connect to Podman socket` después de encender la PC
**Causa:** La VM de Podman quedó en un estado inconsistente.
**Solución:**
```powershell
podman machine stop
podman machine start
podman start backend_tp_mysql
```

### Podman: `exec: "docker-compose": executable file not found`
La extensión Compose no está instalada en Podman Desktop.
Abrir Podman Desktop → **Extensions** → buscar **Compose** → **Install**.

### Docker: `docker compose` no se reconoce
Docker Desktop no está instalado o la versión es muy vieja.
Actualizar Docker Desktop o usar `docker-compose` (con guion).
