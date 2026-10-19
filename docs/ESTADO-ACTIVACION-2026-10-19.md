# Estado de activación — 19 de octubre de 2026

## Comprobado y actualizado

- Worker publicado desde `src/worker.mjs`, versión de salud `2026-10-19-operations`.
- Migración 0004: las columnas, tablas, índice y triggers ya estaban aplicados manualmente. Se verificó el esquema y se registró la migración en `d1_migrations`, sin repetir los ALTER ni modificar pedidos.
- Cron de mantenimiento configurado cada cinco minutos.
- Se conserva la URL de Sandbox de Skydropx en la configuración para que un despliegue no interrumpa las pruebas.
- Precio inicial del detalle y precio «Desde» calculados con los adicionales de acabados; ordenamiento por el precio mínimo real.
- Cobros, guías automáticas y correos permanecen desactivados durante la preparación del catálogo.
- 49 pruebas automatizadas aprobadas. Publicación de GitHub Pages verificada.
- La credencial actual de Mercado Pago es válida y coincide con el vendedor configurado, pero `/users/me` identifica la cuenta como `test_user`.
- Skydropx aceptó la autorización de Sandbox. Aún no están guardados los secretos `SKYDROPX_CLIENT_ID` y `SKYDROPX_CLIENT_SECRET` de producción en este Worker.
- El propietario indicó que cargará precios, inventario y paquetes en el administrador y que añadirá las credenciales reales al final. No se habilitaron ventas ni compras de guías.

## Trabajo del propietario antes de abrir ventas

1. Guardar precios definitivos por acabado. En el editor, el importe del acabado es **adicional al precio base**. Ejemplo: base 180 + adicional 140 = precio final 320.
2. Declarar las existencias reales y peso/medidas del paquete cerrado para cada acabado que se venda. No se han alterado esos datos durante esta actualización.
3. Completar Datos y condiciones del administrador: responsable, contacto, elaboración, entregas, cambios, cancelaciones, daños y privacidad. El servidor aún devuelve `configured: false`.
4. Guardar secretos de producción de Skydropx, confirmar códigos de mercancía y embalaje y validar una cotización real.
5. Confirmar que el token de Mercado Pago pertenece a la cuenta de producción y que el webhook de pagos tiene configurada la URL y firma correspondientes.
6. Tras las comprobaciones, sincronizar los modos reales y el límite de costo de guía en `wrangler.jsonc`. No habilitar compras automáticas de guías sin un límite elegido por el propietario.
7. Hacer una compra controlada y verificar importe, webhook, inventario, guía y seguimiento antes de anunciar ventas.

Los correos automáticos necesitan además un dominio/remitente verificado y la clave de Resend. La página de estado permite consultar el pedido aunque el correo esté desactivado.

## Despliegues posteriores

Revisar las variables locales antes de desplegar: las variables presentes en `wrangler.jsonc` reemplazan sus valores remotos. `--keep-vars` conserva las variables remotas que no estén declaradas, pero no protege las declaradas frente a cambios locales.

```sh
cd cloudflare
pnpm install --frozen-lockfile
pnpm test
pnpm exec wrangler d1 migrations list DB --remote
pnpm run db:migrate
pnpm exec wrangler deploy --keep-vars
```

Conservar `STATUS_SIGNING_SECRET`, D1 y el catálogo existente. No regenerar secretos ni inventario para resolver una conexión.
