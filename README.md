# ARTBAN / 4RTB4N — ODA Studio

Tienda de piezas 3D y arte del estudio en Aguascalientes. Frontend HTML/CSS/JavaScript en GitHub Pages; API en Cloudflare Workers con D1.

- Tienda: https://armando858d.github.io/ODA/
- Administración de catálogo, ofertas, pedidos y conexiones: https://armando858d.github.io/ODA/admin.html
- Existencias y paquetes: https://armando858d.github.io/ODA/admin-inventario.html
- API pública de catálogo: https://oda-pagos.oda-pagos-cloudflare.workers.dev/api/content

## Documentación

[Implementación, cambios, administración y despliegue](docs/IMPLEMENTACION.md) documenta el trabajo realizado, la estructura de archivos, los flujos y las limitaciones. [Configuración del servidor](cloudflare/README.md) contiene las instrucciones de Workers y D1.

## Desarrollo

El frontend no requiere compilación. Sirve esta carpeta con un servidor estático para trabajar localmente; la API restringe las operaciones administrativas al origen configurado en `SITE_URL`.

```sh
cd cloudflare
npm install
npm test
```

La publicación del frontend ocurre en GitHub Pages al actualizar `main`. La API se despliega por separado; un cambio de GitHub Pages no actualiza automáticamente el Worker.

No guardar claves en el repositorio. La clave del administrador se introduce en el panel y solo permanece en memoria durante esa página. La configuración de pagos real debe comprobarse en el servidor: la presencia de botones o logotipos no demuestra que los cobros estén habilitados.
