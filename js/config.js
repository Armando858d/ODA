// Solo configuración pública. Nunca colocar Access Tokens aquí.
// Si la API está en otro dominio, colocar su origen HTTPS, sin barra final.
window.STORE_CONFIG = Object.freeze({ apiBase: 'https://oda-pagos.oda-pagos-cloudflare.workers.dev', mpPublicKey: 'APP_USR-8fbd5fc5-d411-4dba-b2ae-7e6efdc61815',
  socials: Object.freeze({
    instagram: 'https://www.instagram.com/artb4nn?vrfl=MXF3OTl0dzBpODR0eA==',
    facebook: 'https://www.facebook.com/share/1HxyqpYdEP/',
    tiktok: 'https://www.tiktok.com/@artb4nn?_r=1&_t=ZS-9Ags7Nx3fer',
    whatsapp: 'https://wa.me/524492795557'
  }) });

// Public Key proporcionada por el dueño. Checkout Pro por redirección usa
// la preferencia creada en servidor; no necesita esta clave pública.
// La disponibilidad real se consulta en /api/config. No activar cobros de prueba
// en la tienda pública: solo modo live y catálogo vigente permiten continuar.
