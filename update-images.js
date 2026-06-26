const { Database } = require('@sqlitecloud/drivers');
const db = new Database('sqlitecloud://csc2r2zfdk.g4.sqlite.cloud:8860/products?apikey=ed4e2bAmKZ87bUegzYFOVxiWzx45RpniOM9ocEAWz20');

(async () => {
  try {
    await db.sql("ALTER TABLE products ADD COLUMN img TEXT");
    console.log('✓ Columna img agregada');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('✓ Columna img ya existe');
    } else {
      console.error('Error al agregar columna:', e.message);
    }
  }
  
  try {

    await db.sql("UPDATE products SET img = 'cheesecake-frutos-rojos.avif' WHERE id = 1");
    await db.sql("UPDATE products SET img = 'tarta-de-maracuya.jpg' WHERE id = 2");
    await db.sql("UPDATE products SET img = 'lemon-pie.webp' WHERE id = 3");
    await db.sql("UPDATE products SET img = 'dulce-pistacho.jpg' WHERE id = 4");
    await db.sql("UPDATE products SET img = 'orange-pie.jpg' WHERE id = 5");
    await db.sql("UPDATE products SET img = 'torta-oreo.webp' WHERE id = 6");
    await db.sql("UPDATE products SET img = 'torta-matilda.webp' WHERE id = 7");
    await db.sql("UPDATE products SET img = 'torta-brownie.jpg' WHERE id = 8");
    await db.sql("UPDATE products SET img = 'key-lime.webp' WHERE id = 9");
    console.log('✓ Imágenes actualizadas correctamente');
  } catch (e) {
    console.error('Error al actualizar imágenes:', e.message);
  }
  
  await db.close();
})();
