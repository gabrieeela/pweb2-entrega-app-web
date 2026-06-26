# El Patio Vegan

Web para gestionar el carrito de compras de **El Patio Vegan**, una cafetería vegana ubicada en la localidad de Ramos Mejía, Buenos Aires. 
Su especialización es la pastelería, ya que ofrecen opciones aptas para veganos y celíacos.


## Arquitectura elegida

```
Frontend (HTML)
     │
     │  fetch /api/products
     ▼
Backend (Express / Node.js)
     │
     │  @sqlitecloud/drivers
     ▼
Base de datos (SQLite Cloud)
```
 
El frontend consume la API REST del backend para obtener los productos. El carrito se persiste en `localStorage` del navegador para mantener el estado entre páginas. Las pruebas end-to-end se ejecutan con Playwright sobre el servidor corriendo localmente.


## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Backend | Node.js, Express |
| Base de datos | SQLite Cloud (`@sqlitecloud/drivers`) |
| Testing | Playwright |


## Dificultades encontradas y cómo se resolvieron

### 1. Creación de la base de datos en SQLite
La plataforma soporta únicamente archivos con extensiones `.sqlite`, `.sqlite3`, `.db`, `.db3`, `.s3db`, `.sl3` y `.sqlitecloud`. Primero se intentó primero subir un script `.sql`, pero fue necesario generar el archivo `.sqlite` directamente con Python y subirlo vía "Upload Database", o alternativamente crear la base vacía y ejecutar el SQL desde la consola del dashboard, lo que se optó por hacer ya que este proyecto es puramente hecho con JavaScript.

### 2. Conectar el Backend con la base de datos en SQLite
La query de ejemplo con `SELECT * FROM <tablename>` causaba un error de sintaxis al ejecutarse junto con el código real. Para eso se tuvo que generar una API Key para que funcionara.

### 3. Conexión de Frontend con Backend
Los archivos HTML estaban dentro de una subcarpeta `front/` pero `express.static` apuntaba a la raíz del proyecto. Se resolvió cambiando a `express.static(path.join(__dirname, 'front'))`. También fue necesario migrar el carrito de una variable en memoria (`let cart = {}`) a `localStorage` para que los datos persistieran al navegar entre páginas.

### 4. Levantar el servidor en Playwright
La opción `webServer` del config de Playwright causaba timeout porque el proceso `node server.js` no levantaba dentro del tiempo límite en el entorno. Se resolvió levantando el servidor manualmente en una terminal separada y removiendo el bloque `webServer` del config. Además, el error `EPERM: operation not permitted, rmdir test-results` se debía a que la carpeta estaba sincronizándose con OneDrive; se solucionó redirigiendo la salida a `C:/Temp/playwright-output`, fuera del directorio sincronizado.

### 5. Carga de imagenes en el menú
Se tuvo que crear una carpeta dentro del proyecto que contenga todas las imágenes y cargarla en archivo `server.js` ya que en el front no se estaban visualizando.
