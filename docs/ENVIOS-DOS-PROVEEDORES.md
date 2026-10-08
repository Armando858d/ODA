# Envia.com y Skydropx

## Despliegue

Abrir `actualizar-cloudflare.html`, copiar `cloudflare/worker-panel.js` completo y reemplazar el Worker del panel. Mantener D1 y los secretos actuales. No requiere nueva migración de base de datos: el proveedor se guarda dentro del payload de la cotización y las cotizaciones anteriores siguen siendo de Envia.com.

Variables de texto: `SHIPPING_PROVIDER=both`, `SKYDROPX_MODE=live`, `SKYDROPX_LABEL_PURCHASES_ENABLED=false`. Secretos: `ENVIA_TOKEN`, `SKYDROPX_CLIENT_ID`, `SKYDROPX_CLIENT_SECRET`. No cambia el modo ni activa cobros de Mercado Pago. Envia.com conserva su ENVIA_MODE.

## Funcionamiento

Se consultan los proveedores configurados en paralelo. Si uno falla, se conservan las tarifas válidas del otro. El comprador ve proveedor, paquetería, precio y plazo. No se garantiza cobertura de todas las paqueterías. Envia.com consulta las configuradas en ENVIA_CARRIERS; Skydropx utiliza las habilitadas en la cuenta y devuelve las compatibles con este flujo (single/multipackage). No se soporta multishipment ni selección de sucursal en esta versión.

Cada cotización mantiene proveedor, referencia, modo, dirección, artículos e importe calculado por servidor; vence para compra en 10 minutos. Tarifas de un modo diferente al de Mercado Pago se muestran solo para consulta y también se rechazan en el servidor. No se mezclan tarifas de prueba con ventas reales.

OAuth Skydropx usa el host de producción documentado api-pro.skydropx.com, renueva tokens vencidos y no los expone al navegador. No se implementó sandbox de Skydropx: el usuario confirmó cuenta de producción. Las solicitudes de cotización no compran guías. Una cotización incompleta no presenta precios pendientes como definitivos. Si se alcanza el límite del proveedor o falla la conexión se informa una respuesta parcial; no se reintentan automáticamente compras.

## Guías

La compra de Skydropx exige además de LABEL_PURCHASES_ENABLED: SKYDROPX_LABEL_PURCHASES_ENABLED=true, pedido aprobado y modo live coincidente. Sigue desactivada hasta comprobar cuenta, saldo, tarifas y códigos. `SKYDROPX_PACKAGE_CODES` debe contener un objeto JSON por ID de producto con `consignment_note` (código de ocho dígitos verificado por el propietario) y `package_type` (empaque real). No hay códigos predeterminados ni se infieren códigos fiscales a partir del nombre.

Se vuelve a consultar el importe y se compara con el pagado y el máximo autorizado antes de comprar. Se obtiene un bloqueo atómico por pedido, se envía unique_shipment=true y se guarda la respuesta. Si falla la respuesta o falta el PDF, se bloquea la repetición y el administrador debe consultar el estado; cuando hay ID de envío guardado se recuperan sus guías sin crear otro envío. Si no llegó ninguna referencia, debe revisar su cuenta manualmente. Recolecciones, webhooks de rastreo y recargos posteriores no están automatizados.

## Validación y límites

32 pruebas locales aprobadas, incluidas coexistencia, precios, fallo parcial, separación de modos, validación de tarifas, bloqueo de compras, autorización de importe y prevención de guías duplicadas. No se usaron las claves reales ni se generaron guías. La autenticación y cotización real deben verificarse después del despliegue manual; publicar GitHub no actualiza el Worker.

Fuentes revisadas: https://pro.skydropx.com/es-MX/api-docs y https://app.skydropx.com/es-MX/api-docs .

Para reconstruir el archivo del panel: `npx esbuild cloudflare/src/worker.mjs --bundle --format=esm --platform=browser --target=es2022 --outfile=cloudflare/worker-panel.js`.
