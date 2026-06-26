const { Database } = require('@sqlitecloud/drivers');
const db = new Database("sqlitecloud://csc2r2zfdk.g4.sqlite.cloud:8860/products?apikey=ed4e2bAmKZ87bUegzYFOVxiWzx45RpniOM9ocEAWz20");

async function getProducts() {
    try {
        const rows = await db.sql`SELECT * FROM products`;
        return rows.map(row => ({ ...row, gluten_free: row.gluten_free === 1 }));
    } finally {
        await db.close();
    }
}

async function getProductById(id) {
    try {
        const rows = await db.sql`SELECT * FROM products WHERE id = ${id}`;
        if (!rows.length) return null;
        return { ...rows[0], gluten_free: rows[0].gluten_free === 1 };
    } finally {
        await db.close();
    }
}

async function getGlutenFreeProducts() {
    try {
        const rows = await db.sql`SELECT * FROM products WHERE gluten_free = 1`;
        return rows.map(row => ({ ...row, gluten_free: true }));
    } finally {
        await db.close();
    }
}

getProducts().then(products => console.log(products));