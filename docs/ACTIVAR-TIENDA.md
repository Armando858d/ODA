# Activar ARTBAN — actualización de operación

## Estado de esta entrega
El frontend se publica por GitHub Pages. El Worker necesita despliegue separado. No se han usado credenciales reales, enviado correos, cobrado ni comprado guías durante las pruebas. Cloudflare solicita inicio de sesión en este entorno.

## 1. Actualizar Cloudflare sin perder el catálogo
Desde la carpeta `cloudflare`, con Node y la cuenta del propietario:

```sh
npm install
npx wrangler login
npm run db:migrate
npm run deploy
```

Revisar las variables de `wrangler.jsonc` antes de desplegar: los valores incluidos mantienen cobros y compra de guías desactivados. No borrar D1 ni regenerar `STATUS_SIGNING_SECRET`: invalidaría enlaces de pedidos anteriores. La nueva migración `0004_operations.sql` debe ejecutarse antes del Worker. La CLI registra las migraciones; no repetir manualmente el ALTER TABLE.

Alternativa desde el panel: consultar `actualizar-cloudflare.html`. Incluye el SQL y el Worker completo. Aplicar la migración una sola vez en la base correcta, después publicar el Worker manteniendo el binding DB y los secretos. Configurar también el Cron; pegar el JS no configura variables ni tareas programadas.

## 2. Completar datos desde el administrador
- Publicar precios, fotos, colecciones y promociones vigentes.
- Guardar existencias y peso/medidas del paquete **cerrado** para cada acabado.
- Confirmar remitente y origen de envíos.
- Completar Datos y condiciones: responsable, contacto, domicilio público, elaboración, envíos, cambios, cancelaciones, daños y aviso de privacidad. El formulario publica tus textos; no sustituye la revisión de sus contenidos.
- Revisar los códigos de mercancía y embalaje de Skydropx en `SKYDROPX_PACKAGE_CODES`, de acuerdo con los productos reales. No inventar clasificaciones.

## 3. Credenciales y activación
Guardar claves exclusivamente como Secrets del Worker. Nunca en GitHub, formularios de la tienda ni chat.

| Variable / secreto | Uso |
| --- | --- |
| MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, MP_COLLECTOR_ID | Cuenta real de Mercado Pago y firma de notificaciones |
| STATUS_SIGNING_SECRET | Mantener el existente; protege el acceso al estado del pedido |
| ADMIN_TOKEN | Acceso al administrador; mínimo 32 caracteres |
| SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET | Cuenta real Skydropx |
| SKYDROPX_PACKAGE_CODES | JSON de códigos verificados por producto, como explica la guía Skydropx |
| RESEND_API_KEY | Clave de envío de correo, con permiso del dominio verificado |
| EMAIL_FROM | Remitente del dominio verificado, por ejemplo `ARTBAN <pedidos@tu-dominio>`; sustituir por el real |
| EMAIL_ENABLED | `true` solo después de verificar remitente y recepción |
| MP_MODE / SKYDROPX_MODE | `live` para producción, con credenciales del mismo ambiente |
| PAYMENTS_ENABLED | `true` después de verificar pago y webhook |
| LABEL_PURCHASES_ENABLED / SKYDROPX_LABEL_PURCHASES_ENABLED | Ambas `true` para autorizar compra de guías |
| MAX_LABEL_COST_MXN | Límite positivo por pedido elegido por el propietario. No debe superar el envío pagado |
| AUTO_LABELS_ENABLED | `true` después de una guía controlada; autoriza compra automática para pedidos aprobados |
| RESERVATION_RECOVERY_ENABLED | `true`; revisa reservas vencidas sin pago confirmado |

Confirmar `SITE_URL`, `API_URL` y habilitar solo métodos de entrega realmente disponibles. No habilitar tarifas fijas como sustituto de una cotización real. Mantener solo Skydropx.

Webhook de Mercado Pago: `https://oda-pagos.oda-pagos-cloudflare.workers.dev/api/webhooks/mercadopago`. Configurar eventos de pago y el secreto de firma correspondiente.

## 4. Tarea programada
Cron `*/5 * * * *` en Cloudflare. Se incluye en wrangler.jsonc. Procesa lotes pequeños para limitar consumo; una cola grande puede tardar varios ciclos. El webhook también intenta iniciar operación, y Cron recupera trabajo pendiente.

- Reserva: solo libera pedidos con preferencia identificada, vencida y comprobada, después de 24 horas, sin pagos aprobados, pendientes ni resultados incompletos. No libera situaciones inciertas. Si llega un pago tardío, vuelve a reservar de forma atómica; si no hay stock, bloquea el envío y lo muestra en el panel.
- Guía: solo pago aprobado, inventario reservado, modo real y límites autorizados. Nunca vuelve a comprar automáticamente una guía con respuesta incierta. Consultar estado en Skydropx antes de cualquier intervención.
- Correo: confirmación de pago y guía, con cola persistente y clave de idempotencia. Reintentos dentro de 23 horas; fuera de esa ventana pasa a revisión para no duplicar un mensaje. `sent` significa aceptado por Resend, no prueba de entrega a bandeja. Revisar rebotes en Resend.
- Cliente: consulta rastreo y estado desde su enlace firmado; no se publica el PDF de la etiqueta, que puede incluir domicilios.

## 5. Verificación antes de anunciar ventas
1. Abrir tienda desde otra conexión y comprobar que no aparece Catálogo de referencia.
2. `/api/health` debe indicar `version: 2026-10-19-operations`; `/api/config` debe reflejar el ambiente elegido.
3. Crear y editar una pieza desde el panel, comprobar que persiste y revisar stock.
4. Completar un pago de prueba privado, comprobar firma/webhook y estado. Luego el propietario realiza una compra real controlada.
5. Verificar total, descuento, importe de envío, estado de pago y descuento de inventario.
6. Confirmar una guía y rastreo reales, sin duplicado al refrescar.
7. Verificar recepción de ambos correos y vínculo del pedido. Revisar incidencias en el panel.
8. Comprobar rechazo/cancelación y conservación de reservas pendientes. No cancelar o devolver dinero automáticamente durante las pruebas.

## Fuentes de implementación
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://www.mercadopago.com.mx/developers/es/docs/checkout-pro-preferences/additional-settings/term-of-preference
- https://resend.com/changelog/idempotency-keys
- https://resend.com/docs/api-reference/emails/send-email
