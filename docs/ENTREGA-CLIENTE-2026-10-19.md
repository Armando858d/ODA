# ARTBAN / ODA — Entrega visual, 19 de octubre de 2026

## Cambios
- Portada, superficies redondeadas, controles táctiles y composición adaptable a celular.
- Redes oficiales Instagram, Facebook y TikTok centralizadas en `js/config.js`, con botones identificados en el pie.
- Proceso de manufactura interactivo y accesible por teclado.
- 16 fotografías optimizadas a WebP: de 24 MB a 0.60 MB en conjunto. Se conservan originales.
- Mejoras visuales del administrador existente. Conserva edición de piezas, precios, fotos, colecciones y promociones programadas, además de inventario y paquetes.
- El checkout público requiere API habilitada, modo live y catálogo actualizado. Si hay prueba o falla de catálogo, permite consultar al estudio por WhatsApp sin presentar un cobro como realizado.
- El enlace de consulta de pago retira su token de la barra de direcciones tras guardarlo en la sesión de la pestaña.

## Verificación
36 pruebas del backend aprobadas. Revisión automatizada de 10 rutas a 320, 390, 768 y 1440 px sin desbordamiento horizontal. Carrito: agregar pieza y aumentar cantidad. Redes y acordeón de proceso comprobados. Pruebas de interfaz con respuestas API simuladas; no equivalen a un cobro real ni a una guía comprada.

## Antes de aceptar cobros reales
La configuración versionada del Worker permanece en prueba con cobros y compra de guías desactivados. Esta entrega publica el frontend; no despliega ni activa Cloudflare. No fue posible verificar la API remota desde el entorno de trabajo (HTTP 403).

1. Verificar en Cloudflare los secretos privados de Mercado Pago, firma de webhook, Skydropx y administrador; nunca colocarlos en JavaScript público.
2. Confirmar catálogo, precios, existencias, origen y dimensiones de paquetes desde el panel privado.
3. Completar el procedimiento de `docs/SKYDROPX-PRUEBAS.md` y la verificación de pagos indicada en `docs/IMPLEMENTACION.md`.
4. Desplegar y activar producción únicamente tras verificar notificación de pago, importe, inventario, cotización, generación de guía y consulta de seguimiento de extremo a extremo.
5. Confirmar que `/api/config` devuelve el estado operativo esperado y realizar una compra controlada antes de abrir ventas.

GitHub Pages aloja la presentación. El administrador necesita el Worker disponible y una clave privada válida para guardar cambios. Una publicación estática no sustituye ese servicio.
