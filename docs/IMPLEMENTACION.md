# Implementación de ARTBAN — 7 de octubre de 2026

Esta guía describe el estado del código y el trabajo realizado durante la actualización de la tienda. Sustituye las descripciones antiguas de una landing Cyber/Future y de un administrador inexistente. No contiene credenciales ni datos privados de clientes.

## 1. Arquitectura y publicación

El frontend de `Armando858d/ODA` se publica en GitHub Pages. Las páginas HTML cargan el catálogo inicial y después consultan el catálogo del estudio en Cloudflare. El Worker `oda-pagos` utiliza la base D1 `oda-pedidos` mediante el binding `DB`.

La tienda y la API se despliegan por separado. La API actualizada fue publicada manualmente por el propietario desde el editor de Cloudflare después de que el navegador integrado no pudiera completar la verificación de acceso. El 7 de octubre se comprobó una respuesta HTTP 200 de `/api/content` con productos; las colecciones y promociones estaban vacías en esa comprobación. Esto no prueba por sí mismo una compra real ni todas las operaciones autenticadas del panel.

La raíz `/` del Worker devuelve `Ruta no encontrada`: no aloja la tienda. Las rutas de diagnóstico son `/api/health`, `/api/config` y `/api/content`.

## 2. Identidad y diseño

Se recuperó la identidad urbana/skater con fondo carbón, verde lima `#c9fb38`, azul `#3689ff`, tipografía condensada e inclinada y el wordmark 4RTB4N. La pestaña del navegador se titula únicamente ARTBAN en HTML y en los scripts que antes cambiaban ese título.

Se reorganizó la portada con texto editorial y fotografías originales. Las fotos utilizan `object-fit: contain` para mostrar las piezas completas. Las tarjetas, formularios y diálogos tienen esquinas redondeadas, espacios consistentes y contraste oscuro. Las colecciones usan fotografías con un degradado para mantener legibles sus textos.

La franja de “FUERA DEL MOLDE / HECHO CON ACTITUD / ODA STUDIO” tiene fondo blanco, ocupa el ancho completo y recupera una inclinación de -1 grado. Una escala horizontal de 1.015 evita pequeñas esquinas vacías al rotarla. El contenedor recorta el contenido que se desplaza.

Archivos de estilo, en orden: `css/store.css`, `css/urban.css`, `css/skate.css`, `css/refined.css`. El último concentra los ajustes actuales y las reglas responsive. La cascada conserva reglas históricas: al cambiar estilos hay que revisar su orden y sus media queries.

## 3. Experiencia móvil

- Menú compacto hasta 900 px, centrado, con emojis decorativos y etiquetas de texto.
- Apertura/cierre mediante opacidad y desplazamiento; botón con estado `aria-expanded` y etiqueta actualizada.
- Cierre mediante Escape, clic fuera del encabezado o elección de un enlace. Escape devuelve el foco al botón.
- Menú cerrado con `visibility: hidden`, para no dejar enlaces invisibles en el recorrido de teclado.
- Fotografías completas, formularios en una columna y controles táctiles de al menos 44 px en los principales flujos.
- Tarjetas en dos columnas y una columna en pantallas de hasta 360 px.
- Carrito móvil presentado como panel inferior con altura limitada a la pantalla y desplazamiento propio.
- Redes sociales del footer centradas, tanto los textos como Instagram, Facebook, TikTok y WhatsApp.
- Se redujeron efectos de hover y animaciones de entrada innecesarias en teléfono.

No se ha completado una inspección visual en un dispositivo físico dentro de esta sesión. Los cambios responsive se revisaron en código; antes de una campaña conviene comprobar 320, 360, 390, 430 y 768 px y un escritorio, especialmente menú, formularios, carrito y pie de página.

## 4. Carrusel y carga

`js/experience.js` genera cuatro diapositivas. Cambian automáticamente cada 5.5 segundos con una transición de opacidad. Por petición del propietario se retiraron los botones anterior, siguiente y pausa. La animación se detiene cuando la pestaña está oculta, la portada queda fuera de vista o el sistema solicita movimiento reducido. El número y la descripción indican la pieza actual.

`js/catalog-loader.js` crea una capa de carga independiente del contenido, con el logo recibido en `assets/images/artban-logo.png` centrado en el viewport. La marca y la línea de progreso se colocan debajo. Se bloquea temporalmente la interacción con el contenido mientras se construye la página. Al terminar, se restaura la interacción y se desvanece la capa en 450 ms; no hay una espera mínima artificial. La decodificación de la primera imagen tiene un límite de 1.2 s. La consulta del catálogo tiene un límite de 5 s y cada script uno de 12 s.

Si falla el catálogo, se usa el catálogo de referencia con un aviso. Si falla la carga de scripts, se muestra una opción para volver a cargar. `prefers-reduced-motion` elimina las animaciones.

## 5. Administración separada

### Catálogo, pedidos y configuración — `admin.html`

Permite gestionar piezas, colecciones y promociones; revisar los pedidos; guardar el remitente; comprobar conexiones y preparar pedidos de prueba. No contiene los formularios de existencias y paquetes. Su navegación enlaza a la página independiente de inventario.

`js/admin-content.js` construye el editor de contenido: búsqueda, pestañas, creación y edición, precios, acabados, fotos y programación de ofertas. `js/admin.js` gestiona autenticación en memoria, pedidos, origen y conexiones.

### Existencias y paquetes — `admin-inventario.html`

Utiliza `js/admin-inventario.js`. Consulta el estado del inventario, sin cargar pedidos ni el editor del catálogo. Tiene búsqueda por nombre/acabado y un formulario por variante para unidades disponibles, peso en kg, largo, ancho y alto en cm.

Guardar envía `previous_stock` junto con el nuevo stock; el servidor rechaza un guardado si otra operación cambió las existencias mientras el formulario estaba abierto. Se mantienen los límites y validaciones del servidor. Cada unidad utiliza una caja independiente en la cotización actual.

La clave administrativa no se transfiere por URL, localStorage ni sessionStorage. Cada página solicita la clave al entrar y la conserva únicamente en memoria. Recargar o navegar a otra página requiere iniciar sesión de nuevo. Cerrar sesión limpia los formularios y datos mostrados.

## 6. Catálogo, imágenes y promociones

El documento editable se guarda en `store_settings`, clave `content`, e incluye `revision`, productos, colecciones y promociones. El servidor detecta revisiones obsoletas para evitar sobrescribir cambios simultáneos.

Las piezas nuevas generan entradas de inventario con stock cero. Hay que abrir Existencias y paquetes y registrar unidades reales y medidas. Mantener el orden de los acabados de una pieza existente: el inventario los identifica por posición.

El editor acepta JPG, PNG y WebP de hasta 15 MB, reduce sus dimensiones a un máximo de 900 px y los convierte a WebP. La imagen se guarda como datos en el catálogo; no hay almacenamiento R2 implementado. El límite del documento es 1.8 MB y el servidor limita cada imagen. Productos: portada y hasta cuatro imágenes adicionales; colecciones: portada.

Las promociones pueden aplicarse a una colección o a todo el catálogo. El servidor filtra por activación y fechas y aplica el descuento mayor cuando coinciden ofertas, sin acumularlas. También descuenta los importes adicionales de los acabados. El precio del checkout usa ese mismo catálogo del servidor; no acepta el precio enviado por el navegador como autoridad.

Las fechas se capturan en la hora local del dispositivo del administrador y se convierten a ISO. La tienda presenta el fin de la promoción en la zona America/Mexico_City. Las ofertas se evalúan en cada consulta; una pestaña de tienda ya abierta debe recargarse para reflejar cambios.

## 7. Pagos, pedidos y envíos

Mercado Pago usa Checkout Pro. Las credenciales permanecen en secretos del Worker. La API valida importes, moneda, vendedor, modo y referencia del pago; los webhooks requieren firma válida. Los enlaces de estado usan un token firmado. Se conserva el control de idempotencia y la reserva transaccional de stock.

Las animaciones de carrito y estados de pago son presentación visual: no sustituyen la confirmación del servidor. No se habilitaron cobros reales como parte de los cambios de diseño.

Envia.com cotiza con origen, destino, existencias y perfiles de paquetes. La compra de una guía exige pedido aprobado, tarifa comprobada y confirmación explícita en el administrador. Los intentos inciertos se bloquean para revisión, evitando repetir cargos. La atención de entrega local en Aguascalientes se coordina por WhatsApp.

Las opciones reales de cuotas dependen de Mercado Pago; la interfaz no promete meses sin intereses. Las pruebas automatizadas utilizan proveedores simulados y no equivalen a una compra real.

## 8. Archivos relevantes

| Archivo | Responsabilidad |
| --- | --- |
| `index.html`, `tienda.html` y demás páginas | Puntos de entrada y versiones de recursos |
| `js/store.js` | Tienda, menú, tarjetas, carrito y formularios |
| `js/catalog-loader.js` | Carga, consulta de contenido y fallback |
| `js/experience.js` | Carrusel y experiencia de compra |
| `js/skate.js` | Textos y detalles de identidad urbana |
| `js/social.js` | Redes sociales y contacto local |
| `js/lienzos.js` | Sección de lienzos |
| `js/promociones.js` | Colecciones y promociones del servidor |
| `css/refined.css` | Ajustes visuales y responsive actuales |
| `admin.html`, `js/admin.js` | Pedidos, conexiones y panel principal |
| `js/admin-content.js` | Editor de productos, colecciones y ofertas |
| `admin-inventario.html`, `js/admin-inventario.js` | Existencias y paquetes separados |
| `css/admin.css` | Estilos de ambas páginas administrativas |
| `cloudflare/src/worker.mjs` | Router API, pagos y validaciones |
| `cloudflare/src/content.mjs` | Contenido editable y descuentos |
| `cloudflare/src/admin.mjs` | API privada administrativa |
| `cloudflare/src/shipping.mjs` | Cotizaciones y guías |
| `cloudflare/migrations/` | Esquema y migraciones D1 |
| `cloudflare/test/payments.test.mjs` | 26 pruebas del servidor |
| `backend/` | Implementación alternativa histórica; no es el Worker desplegado |

## 9. Configuración y mantenimiento

La configuración no secreta está en `cloudflare/wrangler.jsonc`. Conservar el binding `DB` y los secretos existentes. No regenerar `STATUS_SIGNING_SECRET` de forma rutinaria: invalida enlaces de pedidos anteriores. No subir ADMIN_TOKEN, tokens de proveedores ni datos de clientes a GitHub.

Las migraciones son `0001_orders.sql`, `0002_catalog.sql` y `0003_shipping.sql`. La tercera crea `store_settings` y las tablas de envíos; no volver a ejecutar sus sentencias manualmente sobre una base que ya las tenga. Utilizar el registro de migraciones de Wrangler.

Desde la carpeta `cloudflare`, instalar dependencias, ejecutar `npm test`, autenticar Wrangler en la cuenta autorizada, aplicar las migraciones pendientes con `npm run db:migrate` y publicar con `npm run deploy`. Revisar antes las variables del archivo, porque un despliegue de Wrangler puede actualizar las variables configuradas en el panel.

El código de `src/worker.mjs` importa varios módulos. Para pegarlo en el editor de Cloudflare se necesita un bundle ESM completo, no copiar solo ese archivo. Ejemplo desde la raíz del repositorio:

```sh
npx esbuild cloudflare/src/worker.mjs --bundle --format=esm --platform=browser --target=es2022 --outfile=/tmp/ARTBAN-worker.js
```

Publicar ese bundle en el Worker existente, conservando bindings y secretos. La versión subida a GitHub no actualiza automáticamente el Worker si no se ha conectado un flujo de despliegue.

## 10. Verificación y límites

Se comprobó la sintaxis JavaScript de los scripts modificados. La suite del servidor pasó sus 26 pruebas en esta sesión: catálogo, promociones, validación, precios, inventario, concurrencia, firmas, pagos, cotización y guías. No se compraron guías ni se realizaron cobros reales para validar cambios visuales.

La publicación de GitHub Pages se comprueba mediante el resultado de su workflow. El acceso administrativo depende de ADMIN_TOKEN y las operaciones privadas siguen requiriendo pruebas con una sesión autorizada. El acceso al panel de Cloudflare en el navegador integrado quedó bloqueado por verificación; el propietario completó la publicación desde su navegador.

## 11. Resumen de cambios de la sesión

1. Recuperación de la identidad 4RTB4N y reorganización urbana/skater.
2. Fotografías completas, tarjetas redondeadas y adaptación responsive.
3. Restauración y ajuste de iconos de redes sociales.
4. Pantalla de carga con el logo proporcionado, favicon y título ARTBAN.
5. Franja blanca de ancho completo, ahora ligeramente inclinada.
6. Carrusel automático sin botones; pausa por visibilidad y movimiento reducido.
7. Loader centrado con transición suave y manejo de errores.
8. Menú móvil centrado y animado con emojis decorativos; redes inferiores centradas.
9. Gestión de productos, fotos, colecciones y promociones con persistencia en D1.
10. Publicación manual de la API actualizada y comprobación de `/api/content`.
11. Separación de Existencias y paquetes en su propia página con buscador.
12. Actualización del README y esta guía de implementación y mantenimiento.

## Personalizados y lienzos — 7 de octubre de 2026

La portada conserva la tienda, las piezas destacadas y las colecciones originales, junto con el carrusel automático y la franja inclinada. El apartado de lienzos tiene únicamente dos opciones: Crear mi lienzo y Lienzos disponibles. Tienda vuelve al menú principal.

- `lienzos.html`: catálogo de productos publicados de categoría `lienzo` y precio fijo, con búsqueda, ordenación, favoritos, fotos y carrito compartido. Crear mi lienzo abre `crear-lienzo.html`; Lienzos disponibles lleva al catálogo de esa página.
- `crear-lienzo.html`: formulario de cotización con medidas, concepto y detalles. Prepara un mensaje que el cliente revisa y envía por WhatsApp; no crea un pedido pagado ni genera imágenes.
- Administrador: Piezas y Lienzos se muestran en pestañas separadas sobre el mismo catálogo. Lienzos admite fotos, precio base, variantes por tamaño/acabado, colecciones, visibilidad y cotización. Describe material, medidas y marco en la descripción.
- Para publicar: Admin → Lienzos → Agregar lienzo → fotos y datos → Guardar. Para vender directamente elige Precio fijo. Después abre Existencias y paquetes: los productos nuevos empiezan con stock cero. Configura cantidades y embalaje antes de vender.
- No se crearon obras, precios o stock ficticios. Lienzos disponibles significa obras publicadas a precio fijo; el servidor verifica existencias al comprar.
- `cloudflare/src/content.mjs` incorpora `lienzo` a las categorías válidas; requiere despliegue independiente del Worker. Si se edita el bundle del panel, sustituir `["art-toy","figura","custom"]` por `["art-toy","figura","custom","lienzo"]` y pulsar Implementar. Hasta entonces el servidor rechazará guardar esa categoría. GitHub Pages no despliega este Worker.
- Verificación: sintaxis JavaScript y suite del servidor, incluida persistencia de lienzos, fotos, variantes, stock inicial y respuesta pública. No se realizaron cobros ni cambios de inventario real.
