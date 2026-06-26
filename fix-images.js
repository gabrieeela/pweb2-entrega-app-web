const { Database } = require('@sqlitecloud/drivers');
const db = new Database('sqlitecloud://csc2r2zfdk.g4.sqlite.cloud:8860/products?apikey=ed4e2bAmKZ87bUegzYFOVxiWzx45RpniOM9ocEAWz20');

(async () => {
  try {
    await db.sql("UPDATE products SET img = 'dulce-pistacho.jpg' WHERE id = 3");
    await db.sql("UPDATE products SET img = 'lemon-pie.webp' WHERE id = 4");
    console.log('✓ Imágenes corregidas correctamente');
  } catch (e) {
    console.error('Error:', e.message);
  }
  await db.close();
})();
