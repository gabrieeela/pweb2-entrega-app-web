const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const path = require('path');

const app = express();
const PORT = 3000;

const CONNECTION_STRING = 'sqlitecloud://csc2r2zfdk.g4.sqlite.cloud:8860/products?apikey=ed4e2bAmKZ87bUegzYFOVxiWzx45RpniOM9ocEAWz20';

app.use(express.static(path.join(__dirname, 'front')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());

async function query(sql, params = []) {
    const db = new Database(CONNECTION_STRING);
    try {
        const rows = await db.sql(sql, ...params);
        return rows.map(row => ({ ...row, gluten_free: row.gluten_free === 1 }));
    } finally {
        await db.close();
    }
}

// ENDPOINTS
app.get('/api/products', async (req, res) => {
    try {
        const products = await query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const products = await query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!products.length) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(products[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const gf = req.query.gluten_free;
        const products = gf
            ? await query('SELECT * FROM products WHERE gluten_free = ?', [gf === 'true' ? 1 : 0])
            : await query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.listen(PORT, () => {
    console.log(`Menú: http://localhost:${PORT}/menu.html`);
    console.log(`Carrito: http://localhost:${PORT}/carrito.html`);
    console.log(`API: http://localhost:${PORT}/api/products`);
});