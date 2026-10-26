# Demo · API de productos con MongoDB

API mínima en Node.js (Express + driver oficial `mongodb`) que guarda productos con
formas distintas en **una sola colección**. Es el caso práctico de la exposición.

## Requisitos

- Node.js 18 o superior
- Docker Desktop **encendido** (o una cadena de conexión de MongoDB Atlas)

## Correrla (3 terminales)

```bash
# Terminal 1 · levantar MongoDB en un contenedor
docker compose up -d

# Terminal 2 · instalar y arrancar la API
npm install
npm start            # → API lista en http://localhost:3000

# Terminal 3 · recorrer la demo paso a paso (Enter entre pasos)
npm run demo
```

Con **Atlas** en lugar de Docker, se cambia solo la cadena de conexión:

```powershell
$env:MONGO_URI="mongodb+srv://<usuario>:<db_password>@<cluster>.mongodb.net/"
npm start
```

## Qué muestra cada paso

| Paso | Petición | Idea que demuestra |
|---|---|---|
| 1–3 | `POST /productos` | Playera con `talla`, lámpara con `voltaje`, libro con `autor` embebido: tres formas, una colección |
| 4 | `GET /productos` | Los documentos salen tal como se guardaron, ya en JSON |
| 5 | `GET /productos?maxPrecio=350` | Filtro con el operador `$lte` (equivale a `WHERE precio <= 350`) |
| 6 | `PATCH /productos/PLY-01` | `$set` agrega `colores` sin `ALTER TABLE` |
| 7 | `POST` sin precio | La validación vive en la API: MongoDB no la exige por defecto |
| 8 | `DELETE /productos/LAM-01` | Responde `204` |

Ver los datos directo en la base:

```bash
docker exec -it mongo-demo mongosh tienda --eval "db.productos.find()"
```

## Reiniciar antes de volver a ensayar

`npm run demo` inserta los mismos `sku`; si ya existen, la API responde `409`.
Para empezar en limpio:

```bash
docker compose down -v && docker compose up -d
```
