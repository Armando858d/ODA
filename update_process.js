const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  {
    old: '<div class="section-subtitle">NUESTRO FLUJO</div>',
    new: '<div class="section-subtitle">NUESTRA METODOLOGÍA</div>'
  },
  {
    old: 'De tu idea a la pieza final — rápido, preciso y premium.',
    new: 'De la conceptualización a la pieza final — precisión técnica, agilidad y calidad certificada.'
  },
  {
    old: '<div class="step-title">CONSULTA</div>',
    new: '<div class="step-title">CONSULTORÍA</div>'
  },
  {
    old: 'Nos cuentas tu idea y para qué la necesitas. Te damos una propuesta con precio y tiempo.',
    new: 'Analizamos tu proyecto y sus requerimientos específicos. Te entregamos una propuesta detallada que incluye viabilidad técnica, costos y tiempos exactos de producción.'
  },
  {
    old: '<div class="step-title">DISEÑO</div>',
    new: '<div class="step-title">DESARROLLO Y OPTIMIZACIÓN</div>'
  },
  {
    old: 'Creamos el modelo 3D o arreglamos tu archivo para que se imprima bien.',
    new: 'Diseñamos el modelo 3D desde cero o auditamos tu archivo existente, optimizando su geometría para garantizar una manufactura digital impecable.'
  },
  {
    old: '<div class="step-title">IMPRESIÓN</div>',
    new: '<div class="step-title">MANUFACTURA Y CONTROL</div>'
  },
  {
    old: 'Imprimimos tu pieza con buen detalle y revisamos que salga correcta.',
    new: 'Materializamos tu pieza utilizando tecnología de fabricación avanzada. Aplicamos una estricta revisión durante y después del proceso para asegurar resolución, resistencia y tolerancias perfectas.'
  },
  {
    old: '<div class="step-title">ENTREGA</div>',
    new: '<div class="step-title">ACABADO Y ENTREGA</div>'
  },
  {
    old: 'Te entregamos la pieza terminada, bien protegida y lista para usar o lucir.',
    new: 'Realizamos el tratamiento final de la pieza y te entregamos un producto con calidad de exhibición o uso industrial, perfectamente protegido y listo para su aplicación.'
  }
];

let updated = false;

for (const r of replacements) {
  // Try exact match first
  if (html.includes(r.old)) {
    html = html.replace(r.old, r.new);
    updated = true;
  } else {
    // Some lines might have weird spacing or accents in the file (e.g., Diseo)
    // Let's do a more robust regex replacement if the simple one fails
    // But since we are replacing just the text, we can be flexible.
    console.log("Could not find exact match for: " + r.old);
  }
}

// Fallback regex for specific lines with potential encoding issues in source
html = html.replace(/<div class="step-title">DISE\O<\/div>/i, '<div class="step-title">DESARROLLO Y OPTIMIZACIÓN</div>');
html = html.replace(/Creamos el modelo 3D o arreglamos tu archivo para que se imprima bien./, 'Diseñamos el modelo 3D desde cero o auditamos tu archivo existente, optimizando su geometría para garantizar una manufactura digital impecable.');
html = html.replace(/<div class="step-title">IMPRESI\N<\/div>/i, '<div class="step-title">MANUFACTURA Y CONTROL</div>');

fs.writeFileSync('index.html', html);
console.log('Process section updated successfully.');
