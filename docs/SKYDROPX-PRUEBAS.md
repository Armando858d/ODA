# Skydropx como único proveedor — 7 de octubre de 2026

Sustituye la configuración de dos proveedores. El punto de entrada HTTP fuerza Skydropx y descarta ENVIA_TOKEN, incluso con variables antiguas en Cloudflare. Se retiran botones, diagnósticos y menciones de Envia del flujo público. Los ayudantes antiguos permanecen internos para compatibilidad de historial/pruebas, sin activación HTTP.

Skydropx test usa SKYDROPX_TEST_CLIENT_ID, SKYDROPX_TEST_CLIENT_SECRET y SKYDROPX_TEST_API_URL. El origen HTTPS debe confirmarse en la documentación de la cuenta Sandbox; no se ha podido recuperar su especificación pública. Solo se permiten subdominios de Skydropx identificados como sb/sandbox, sin rutas ni credenciales en URL. No existe fallback a claves o servidor de producción. Los tokens se separan por origen y credenciales.

MP_MODE=test se conserva. El pedido de prueba privado de Mercado Pago ya no depende de ENVIA_MODE. No se activaron cobros públicos ni compras de guías. Falta confirmar si el usuario se refería a Mercado Pago o a ventas de Mercado Libre; no se implementa una integración de marketplace sin aclararlo.

Actualizar worker.js desde actualizar-cloudflare.html. Configurar SHIPPING_PROVIDER=skydropx, SKYDROPX_MODE=test, LABEL_PURCHASES_ENABLED=false y SKYDROPX_LABEL_PURCHASES_ENABLED=false. Obtener claves y host desde https://sb-pro.skydropx.com/merchant_stores/applications. Comprobar OAuth, cotización y pago de prueba; no declarar listo para producción hasta validar externamente.
