# Revisión de tienda y servicios — 7 de octubre de 2026 (México)

## Comprobaciones realizadas

- API pública `/api/health`: HTTP 200, base de datos disponible y cobros desactivados.
- `/api/config`: `enabled: false`, `mode: test`, `shipping_provider: envia`, `shipping_enabled: true`, `pickup_enabled: false`. Que haya configuración de envío no confirma una tarifa ni una guía real.
- `/api/content`: 14 productos publicados; ninguno de categoría lienzo en el momento de revisar. No se cargaron productos ficticios.
- Suite local: 27 pruebas del servidor aprobadas, incluidos precios, inventario, concurrencia, pagos, firma, promociones, lienzos y compra de guías.
- Navegador: portada, menú, filtro de lienzos, retorno al catálogo, detalle, carrito y formulario de entrega. No se realizaron cobros, compras de guías ni solicitudes con datos de clientes.

## Correcciones

- Sincronización del filtro con la URL: antes, al pasar de Lienzos a Todo y recargar, volvía a Lienzos.
- Estado vacío de lienzos con explicación y enlace a Crear mi lienzo.
- Textos decorativos del CSS en español.
- Consultas del administrador con tiempo máximo y manejo de respuestas no válidas; descarte de una carga pendiente del catálogo al cerrar sesión.
- El indicador del admin utiliza la configuración efectiva del pago, además de la credencial guardada.

## Cloudflare: pendientes de verificación privada

La salud pública del Worker no confirma que todos los secretos, inventarios, paquetes y permisos del proveedor sean válidos. No se pudo comprobar el panel privado ni la versión desplegada del validador de lienzos sin acceso autenticado. Sigue pendiente verificar que el Worker acepte `lienzo` y ejecutar una cotización y un pago de prueba desde el panel. No activar cobros reales únicamente cambiando una bandera.

El sitio y el Worker se despliegan por separado. Las correcciones de esta revisión son del sitio y no cambian los secretos ni el modo del Worker.

## Skydropx

La integración actual está escrita para Envia.com. Skydropx no está conectado y no es suficiente sustituir una clave. Su API utiliza Client ID y Client Secret para obtener un token OAuth; las credenciales están en Conexiones → API. El flujo documentado es crear cotización, esperar `is_completed`, seleccionar `rate_id` y crear el envío. Deben contemplarse la renovación del token, paquetes, códigos de Carta Porte, seguimiento y prevención de compras repetidas.

Antes de implementar la migración: confirmar acceso a la nueva API de la cuenta, credenciales de pruebas guardadas como secretos del servidor, origen y medidas/peso reales del paquete. Probar cotización primero; la compra de una guía consume saldo y requiere una decisión explícita sobre el costo.

Fuentes oficiales consultadas:
- https://app.skydropx.com/es-MX/api-docs
- https://ayuda.skydropx.com/integraciones/api/

La página de ayuda avisa de la retirada de la API anterior en abril de 2026: una nueva conexión debe seguir la documentación vigente de la cuenta.
