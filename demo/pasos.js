// Recorre la demo paso a paso: muestra cada petición y su respuesta, y espera Enter.
import { createInterface } from 'node:readline/promises';

const API = 'http://localhost:3000';
const rl = createInterface({ input: process.stdin, output: process.stdout });

const pasos = [
  ['1. Insertar una playera (tiene talla)', 'POST', '/productos',
    { sku: 'PLY-01', nombre: 'Playera', precio: 199, talla: 'M' }],
  ['2. Insertar una lámpara (tiene voltaje, no talla)', 'POST', '/productos',
    { sku: 'LAM-01', nombre: 'Lámpara', precio: 450, voltaje: '127 V' }],
  ['3. Insertar un libro con el autor embebido', 'POST', '/productos',
    { sku: 'LIB-01', nombre: 'Libro', precio: 320, paginas: 280, autor: { nombre: 'Gabriel García Márquez', pais: 'Colombia' } }],
  ['4. Listar: tres formas distintas en la misma colección', 'GET', '/productos'],
  ['5. Filtrar con $lte: productos de 350 o menos', 'GET', '/productos?maxPrecio=350'],
  ['6. Agregar un campo nuevo sin ALTER TABLE', 'PATCH', '/productos/PLY-01',
    { colores: ['negro', 'blanco'] }],
  ['7. Validación en la API: falta el precio', 'POST', '/productos',
    { sku: 'X-01', nombre: 'Sin precio' }],
  ['8. Borrar la lámpara', 'DELETE', '/productos/LAM-01'],
];

for (const [titulo, method, ruta, body] of pasos) {
  await rl.question(`\n\x1b[32m${titulo}\x1b[0m  (Enter)`);
  console.log(`\x1b[2m${method} ${ruta}${body ? ' ' + JSON.stringify(body) : ''}\x1b[0m`);
  try {
    const res = await fetch(API + ruta, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    });
    const texto = await res.text();
    console.log(`→ ${res.status}`, texto ? JSON.stringify(JSON.parse(texto), null, 2) : '');
  } catch (err) {
    console.error('¿Está corriendo la API? (npm start)', err.message);
  }
}
rl.close();
