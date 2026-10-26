import express from 'express';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const productos = client.db('tienda').collection('productos');

const app = express();
app.use(express.json());

// Validamos solo lo que todos los productos comparten; el resto de campos es libre.
function validar(body) {
  if (typeof body.sku !== 'string' || !body.sku.trim()) return 'sku es obligatorio';
  if (typeof body.nombre !== 'string' || !body.nombre.trim()) return 'nombre es obligatorio';
  if (typeof body.precio !== 'number' || body.precio < 0) return 'precio debe ser un número >= 0';
  return null;
}

app.post('/productos', async (req, res) => {
  const error = validar(req.body ?? {});
  if (error) return res.status(400).json({ error });
  const { insertedId } = await productos.insertOne(req.body);
  res.status(201).json({ _id: insertedId, ...req.body });
});

// GET /productos?maxPrecio=300 filtra con el operador $lte
app.get('/productos', async (req, res) => {
  const max = Number(req.query.maxPrecio);
  const filtro = Number.isFinite(max) ? { precio: { $lte: max } } : {};
  res.json(await productos.find(filtro).toArray());
});

app.get('/productos/:sku', async (req, res) => {
  const p = await productos.findOne({ sku: req.params.sku });
  p ? res.json(p) : res.sendStatus(404);
});

// Agregar un campo nuevo no requiere ALTER TABLE: $set lo crea si no existe.
app.patch('/productos/:sku', async (req, res) => {
  const { _id, sku, ...cambios } = req.body ?? {};
  if (!Object.keys(cambios).length) return res.status(400).json({ error: 'No hay campos para cambiar' });
  const r = await productos.updateOne({ sku: req.params.sku }, { $set: cambios });
  r.matchedCount ? res.json(await productos.findOne({ sku: req.params.sku })) : res.sendStatus(404);
});

app.delete('/productos/:sku', async (req, res) => {
  const r = await productos.deleteOne({ sku: req.params.sku });
  res.sendStatus(r.deletedCount ? 204 : 404);
});

// Express 5 manda aquí los errores de las rutas async (p. ej. Mongo caído).
app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'Ese sku ya existe' });
  console.error(err.message);
  res.status(500).json({ error: 'Error al hablar con MongoDB' });
});

try {
  await client.connect();
  await productos.createIndex({ sku: 1 }, { unique: true });
  app.listen(3000, () => console.log('API lista en http://localhost:3000'));
} catch (err) {
  console.error('No se pudo conectar a MongoDB:', err.message);
  process.exit(1);
}
