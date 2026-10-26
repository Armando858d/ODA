# Prueba privada de un peso

Actualización 2026-10-26.

El propietario genera un cupón desde Configuración del administrador. Los dos endpoints `/api/admin/payment-test-coupon` y `/api/admin/payment-test-checkout` exigen el token privado y el origen permitido. Nunca insertar un cupón real en GitHub.

El código aleatorio vence en una hora; solo se persiste su SHA-256 en store_settings. Una restricción única en orders.request_key permite crear un único pedido por cupón, incluso con solicitudes simultáneas. Los reintentos conservan el enlace del mismo pedido; una respuesta incierta se bloquea para revisión.

El servidor fija el total en 100 centavos MXN y el envío en cero, independientemente del contenido del cliente. Se registra un artículo de diagnóstico, sin reservar inventario, sin fila de envío y sin fabricación. La operación automática excluye este pedido y no envía correos de venta. El pago sí es real y utiliza las mismas verificaciones de importe, vendedor, ambiente, firma y estado que los demás pedidos.

## Activación

1. Publicar el frontend en GitHub Pages.
2. Desde actualizar-cloudflare.html copiar el bundle y reemplazar worker.js en Cloudflare. Conservar DB, secretos y variables actuales. Esta actualización no requiere migración nueva. No repetir migraciones ya aplicadas.
3. Comprobar /api/health: versión 2026-10-26-private-payment-test y payments_enabled true.
4. Abrir Administrador → Configuración → Prueba privada de $1 MXN, generar cupón y preparar enlace.
5. El propietario completa el pago en Mercado Pago. Revisar el estado en la página de retorno y en Ventas.

Si Mercado Pago rechaza el importe mínimo, no se sustituye por otro importe ni se repite automáticamente. Esta prueba no valida envíos, correos ni producción.
