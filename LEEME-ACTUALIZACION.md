# ODA — actualización de diseño y administración

## Qué incluye

- Diseño de la tienda con esquinas redondeadas, tarjetas suaves y controles cómodos en celular.
- Inicio, catálogo, personalizados, estudio, envíos, carrito, formulario de compra y estado del pago con estilos coherentes.
- Administrador: buscador, editor de piezas, precio base y acabados, múltiples fotos, visibilidad y piezas destacadas.
- Colecciones: nombre, descripción, portada, visibilidad y asignación de piezas.
- Promociones porcentuales: globales o por colección, activación manual, inicio y fin programados. Aplica el mayor descuento; no se acumulan.
- Carrito animado durante la validación del pago y en la página de estado. La animación no significa que el paquete haya sido enviado.
- Catálogo persistente en D1, con protección ante cambios concurrentes. El servidor recalcula los precios al cobrar.

## Cómo actualizar tu instalación actual

1. Conserva tus secretos actuales de Cloudflare. No se incluyen ni se requieren en el código del navegador.
2. Desde la carpeta `cloudflare`, instala las dependencias con `npm install`.
3. Inicia sesión en tu cuenta de Cloudflare si hace falta: `npx wrangler login`.
4. Aplica las migraciones pendientes: `npm run db:migrate`. El catálogo utiliza la tabla `store_settings` de la migración 0003; no se necesita una tabla adicional.
5. Despliega el servidor actualizado: `npm run deploy`.
6. Sube los HTML, la carpeta `js`, la carpeta `css` y los recursos `assets` del proyecto a tu repositorio actual de GitHub Pages. Conserva su estructura. No basta con subir solo admin.html.
7. Abre `admin.html`, entra con tu clave privada habitual y pulsa Actualizar datos. Si conservabas la página abierta, recárgala.
8. Crea una colección, agrega o edita piezas y configura sus existencias y medidas. Comprueba la tienda en otra pestaña.

El código conserva las direcciones públicas de tu proyecto existente. Si cambias de dominio, actualiza `SITE_URL` en `cloudflare/wrangler.jsonc` y la dirección de API en `js/config.js` y `js/admin.js`.

## Uso del panel

- **Piezas:** Agregar pieza → nombre, descripción, fotos, precio, acabados, colección → Guardar y publicar.
- **Fotos:** selecciona hasta cinco JPG/PNG/WebP. La primera será la portada. Elegir un nuevo grupo reemplaza el anterior; también puedes usar una URL HTTPS para la portada. Se optimizan automáticamente, sin subir archivos ejecutables.
- **Acabados:** escribe una línea por acabado, por ejemplo `Pintado a mano | 350`. El importe se suma al precio base. Conserva las posiciones de acabados existentes para no cambiar la asociación de existencias.
- **Existencias:** toda pieza nueva empieza con stock cero. Configura stock, peso y dimensiones del paquete para habilitar su venta/envío. Los personalizados se cotizan.
- **Colecciones:** crea la colección antes de asignar piezas. Ocultar la colección retira su acceso de la tienda; para retirar una pieza de la venta, desmarca Visible en la tienda en esa pieza.
- **Promociones:** selecciona colección o catálogo completo, porcentaje, fecha inicial y fecha final opcional. Las horas del formulario corresponden a tu dispositivo y se guardan como instantes UTC. La oferta se determina al cargar la tienda y se vuelve a validar al pagar; una pestaña abierta debe recargarse para actualizar sus precios.
- **Ocultar:** permite retirar piezas sin destruir su historial de pedidos. No se borran pedidos ni se reinicia el stock al editar un precio.

## Límites y estado

La edición está implementada en el código entregado; no se ha desplegado en tu cuenta ni modificado tu web pública. Hasta actualizar el Worker, la tienda muestra el catálogo de referencia con un aviso y el administrador no puede guardar el nuevo contenido.

Se conserva el modo de pruebas y la configuración de activación de pagos existente. Esta entrega no activa cobros reales ni realiza compras de guías. Verifica una compra de prueba con tus cuentas antes de habilitar pagos reales.

Esta versión almacena las fotos optimizadas junto al catálogo en D1. Admite hasta 100 piezas, 40 colecciones y 40 promociones, con un máximo conjunto de 1.8 MB; para muchos productos usa URLs HTTPS de imágenes alojadas externamente. Cada imagen incorporada tiene un límite aproximado de 185 KB. El panel informa si se supera la capacidad.

Validación realizada: 26 pruebas automáticas aprobadas, revisión de sintaxis de 27 scripts y referencias locales de los HTML. No se realizó una prueba visual en navegador ni una transacción real con Mercado Pago/Envia.com en este entorno.
