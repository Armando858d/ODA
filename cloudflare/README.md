# ODA · Cloudflare Workers + D1

Backend de Checkout Pro adaptado al plan gratuito de Workers/D1, sujeto a las cuotas de Cloudflare. La tienda continúa en GitHub Pages. No requiere Render ni un disco contratado.

## Despliegue realizado

- Worker: `oda-pagos`
- API: https://oda-pagos.oda-pagos-cloudflare.workers.dev
- Base D1: `oda-pedidos`, binding `DB`
- Tienda: https://armando858d.github.io/ODA/index.html
- Comprobación de base de datos: `/api/health`
- Configuración pública: `/api/config`
- `MP_MODE=test`, `PAYMENTS_ENABLED=false`, inventario inicial cero.
- `STATUS_SIGNING_SECRET` generado y guardado como secreto de Cloudflare. No regenerarlo: invalida los enlaces anteriores de consulta de pedidos.

## Lo que falta para probar Mercado Pago

En Cloudflare > Workers & Pages > oda-pagos > Settings > Variables and Secrets, guardar como **Secret**:

| Nombre | Contenido |
| --- | --- |
| MP_ACCESS_TOKEN | Access Token de la cuenta correspondiente al entorno de prueba |
| MP_WEBHOOK_SECRET | Secreto de firma de Webhooks de la integración |
| MP_COLLECTOR_ID | ID numérico del vendedor correspondiente al token |

No subir esas credenciales al repositorio ni compartirlas en chats. La Public Key del frontend no sustituye el Access Token.

Registrar en Mercado Pago la notificación de pagos:
`https://oda-pagos.oda-pagos-cloudflare.workers.dev/api/webhooks/mercadopago`

Las variables no secretas están en `wrangler.jsonc`. Si se cambian desde el panel, actualizar también este archivo antes de volver a desplegar: Wrangler publica las variables del archivo.

Antes de habilitar pruebas, confirmar al menos una modalidad:

- `PICKUP_CONFIRMED=true`: recolección acordada, cargo cero.
- `SHIPPING_RATES_CONFIRMED=true`: aceptar las tarifas configuradas en `SHIPPING_LOCAL`, `SHIPPING_CENTRO`, `SHIPPING_NACIONAL`. Son tarifas fijas por rangos de CP, sin consulta de cobertura a paqueterías.

Declarar únicamente existencias reales. Ejemplo de comando para fijar cinco Venom sin pintar disponibles (acabado 0; pintado es 1):

```sh
pnpm exec wrangler d1 execute DB --remote --command="UPDATE inventory SET stock=5 WHERE product_id='venom-001' AND variant=0"
```

Configurar `PAYMENTS_ENABLED=true` solo cuando esté listo el entorno de prueba. Hacer pruebas con usuarios/tarjetas de prueba del proveedor y comprobar aprobación, rechazo, pendiente, webhook, importes, retorno y reembolso. Las 14 pruebas automatizadas usan un proveedor simulado: no sustituyen estas comprobaciones.

Para producción, configurar las credenciales adecuadas, `MP_MODE=live` y confirmar stock, envíos y condiciones de venta. No hay promesa de meses sin intereses: el máximo de 12 cuotas depende de lo que Mercado Pago permita y muestre al comprador.

## Mantenimiento

Con Node 22+ y pnpm:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write
pnpm exec wrangler d1 migrations apply DB --remote
pnpm run deploy
```

No ejecutar migraciones de pruebas ni rellenar inventario ficticio en la base remota. Las migraciones iniciales solo crean tablas e inventario a cero; el registro de migraciones evita repetirlas.

`src/catalog.mjs` es la autoridad de precios del checkout; mantenerlo alineado con `js/catalog.js` de la tienda. Las promociones y lienzos permanecen por cotización: no se aplican descuentos ni regalos automáticamente al checkout.

Cada pedido reserva stock mediante una transacción D1 y triggers. Una misma clave de intento no crea dos preferencias. Si Mercado Pago no responde, el pedido conserva la reserva y queda para revisión; no liberar unidades sin conciliar primero con el proveedor. No hay panel administrativo, liberación automática de reservas ni integración con paquetería.

El estado se verifica contra la API de Mercado Pago: monto, moneda, vendedor, modo y referencia. La consulta exige un token firmado y no devuelve nombre, correo o domicilio. El código no guarda datos de tarjeta. Los logs de observabilidad están desactivados para evitar registrar enlaces con tokens; no registrar cuerpos ni encabezados sensibles al depurar.

El límite de solicitudes incluido es por instancia del Worker, no una cuota global. Revisar métricas y reforzar las reglas de Cloudflare antes de una campaña de tráfico alto. Los límites gratuitos pueden interrumpir el servicio al agotarse; no se contrató un plan de pago. Gestionar acceso, retención y respaldos de D1 porque almacena datos de pedidos.

## Pruebas

`node --test test/*.test.mjs`: precios del servidor, datos inválidos, rollback, idempotencia, concurrencia, falta de stock, respuesta incierta, validación de pago, reembolsos, notificación adelantada, firmas, consulta protegida y CORS. SQLite ejecuta el SQL real de las migraciones con un adaptador del contrato transaccional de D1. La migración remota y el endpoint de salud se verifican separadamente.
