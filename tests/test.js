const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const MENU_URL = `${BASE_URL}/menu.html`;
const CARRITO_URL = `${BASE_URL}/carrito.html`;
const API_URL = `${BASE_URL}/api/products`;

async function clearCart(page) {
  await page.goto(MENU_URL);
  await page.evaluate(() => localStorage.removeItem('el-patio-cart'));
}

// backend
test.describe('API /api/products', () => {

  test('devuelve 200 y un array de productos', async ({ request }) => {
    const res = await request.get(API_URL);
    expect(res.status()).toBe(200);

    const products = await res.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('cada producto tiene id, name, description, price y gluten_free', async ({ request }) => {
    const res = await request.get(API_URL);
    const products = await res.json();

    for (const p of products) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('description');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('gluten_free');
      expect(typeof p.gluten_free).toBe('boolean');
    }
  });

  test('GET /api/products/:id devuelve el producto correcto', async ({ request }) => {
    const res = await request.get(`${API_URL}/1`);
    expect(res.status()).toBe(200);

    const product = await res.json();
    expect(product.id).toBe(1);
    expect(product.name).toBeTruthy();
  });

  test('GET /api/products/:id con id inexistente devuelve 404', async ({ request }) => {
    const res = await request.get(`${API_URL}/9999`);
    expect(res.status()).toBe(404);
  });

});

// front menú
test.describe('Página de menú', () => {

  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test('carga y muestra productos', async ({ page }) => {
    await page.goto(MENU_URL);

    // la página está cargando
    await expect(page.locator('.product-card')).toHaveCount(9, { timeout: 8000 });
  });

  test('cada producto tiene nombre, precio y botón de agregar', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.product-card');

    const cards = page.locator('.product-card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.product-name')).not.toBeEmpty();
      await expect(card.locator('.product-price')).not.toBeEmpty();
      await expect(card.locator('.add-btn')).toBeVisible();
    }
  });

  test('el badge del carrito empieza en 0 (oculto)', async ({ page }) => {
    await page.goto(MENU_URL);
    const badge = page.locator('#cart-count');
    await expect(badge).toBeHidden();
  });

  test('al agregar un producto el badge muestra 1', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').first().click();

    const badge = page.locator('#cart-count');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });

  test('al agregar dos productos distintos el badge muestra 2', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    const btns = page.locator('.add-btn');
    await btns.nth(0).click();
    await btns.nth(1).click();

    await expect(page.locator('#cart-count')).toHaveText('2');
  });

  test('al agregar el mismo producto dos veces el badge muestra 2', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').first().click();
    await page.locator('.add-btn').first().click();

    await expect(page.locator('#cart-count')).toHaveText('2');
  });

  test('muestra el toast al agregar un producto', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').first().click();

    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Agregado');
  });

});

// persistencia
test.describe('Persistencia del carrito (localStorage)', () => {

  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test('el carrito persiste al recargar la página del menú', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    await page.reload();
    await expect(page.locator('#cart-count')).toHaveText('1');
  });

  test('los datos guardados en localStorage tienen el formato correcto', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('el-patio-cart') || '{}')
    );

    const keys = Object.keys(cart);
    expect(keys.length).toBe(1);

    const item = cart[keys[0]];
    expect(item).toHaveProperty('qty', 1);
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('price');
    expect(typeof item.price).toBe('number');
  });

  test('el carrito acumula cantidad correctamente en localStorage', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').first().click();
    await page.locator('.add-btn').first().click();
    await page.locator('.add-btn').first().click();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('el-patio-cart') || '{}')
    );

    const item = Object.values(cart)[0];
    expect(item.qty).toBe(3);
  });

});

// front carrito
test.describe('Página de carrito', () => {

  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test('carrito vacío muestra mensaje y link al menú', async ({ page }) => {
    await page.goto(CARRITO_URL);
    await expect(page.locator('.empty-msg')).toBeVisible();
    await expect(page.locator('.empty-msg a')).toHaveAttribute('href', /menu\.html/);
  });

  test('muestra los productos agregados desde el menú', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    await page.goto(CARRITO_URL);
    await expect(page.locator('.cart-table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('muestra nombre, precio y cantidad correctamente', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    const productName = await page.locator('.product-name').first().innerText();
    await page.locator('.add-btn').first().click();

    await page.goto(CARRITO_URL);

    const row = page.locator('tbody tr').first();
    await expect(row).toContainText(productName.toLowerCase());
    await expect(row).toContainText('x1');
    await expect(row).toContainText('11.800');
  });

  test('el total se calcula correctamente', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').nth(0).click();
    await page.locator('.add-btn').nth(1).click();

    await page.goto(CARRITO_URL);
    await expect(page.locator('.total-box')).toContainText('23.600');
  });

  test('botón + incrementa la cantidad', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    await page.goto(CARRITO_URL);

    const row = page.locator('tbody tr').first();
    await row.locator('.qty-btn').nth(1).click();

    await expect(page.locator('.qty-display')).toHaveText('2');
  });

  test('botón - decrementa la cantidad y elimina si llega a 0', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    await page.goto(CARRITO_URL);

    await page.locator('.qty-btn').first().click();

    await expect(page.locator('.empty-msg')).toBeVisible();
  });

  test('botón ✕ elimina el producto', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');
    await page.locator('.add-btn').first().click();

    await page.goto(CARRITO_URL);
    await page.locator('.remove-btn').first().click();

    await expect(page.locator('.empty-msg')).toBeVisible();
  });

});

// compra completa
test.describe('Flujo de compra completo', () => {

  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test('agrega productos → va al carrito → finaliza pedido → carrito queda vacío', async ({ page }) => {
    // abrir menú
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    // agrega productos
    await page.locator('.add-btn').nth(0).click();
    await page.locator('.add-btn').nth(1).click();
    await page.locator('.add-btn').nth(2).click();
    await expect(page.locator('#cart-count')).toHaveText('3');

    // ve el carrito
    await page.locator('a[href="carrito.html"]').click();
    await expect(page).toHaveURL(/carrito\.html/);

    // verifica que estén los productos
    await expect(page.locator('tbody tr')).toHaveCount(3);

    // verifica total de la compra
    await expect(page.locator('.total-box')).toContainText('35.400');

    // fin pedido
    await page.locator('.checkout-btn').click();

    // carrito vacío
    await expect(page.locator('.empty-msg')).toBeVisible();

    // limpia almacenamiento local
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('el-patio-cart') || '{}')
    );
    expect(Object.keys(cart).length).toBe(0);
  });

  test('el badge del nav en carrito refleja la cantidad correcta', async ({ page }) => {
    await page.goto(MENU_URL);
    await page.waitForSelector('.add-btn');

    await page.locator('.add-btn').nth(0).click();
    await page.locator('.add-btn').nth(0).click();
    await page.locator('.add-btn').nth(1).click();

    await page.goto(CARRITO_URL);
    await expect(page.locator('#cart-count')).toHaveText('3');
  });

  test('los productos del menú vienen de la API', async ({ page }) => {
    let apiCalled = false;

    page.on('response', res => {
      if (res.url().includes('/api/products')) apiCalled = true;
    });

    await page.goto(MENU_URL);
    await page.waitForSelector('.product-card', { timeout: 8000 });

    expect(apiCalled).toBe(true);
  });

});