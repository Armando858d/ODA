const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix "NUESTRO FLUJO" to "NUESTRA METODOLOGÍA"
html = html.replace(/<span class="title-main">NUESTRO<\/span>\s*<span class="title-accent">FLUJO<\/span>/, '<span class="title-main">NUESTRA</span>\n            <span class="title-accent">METODOLOGÍA</span>');

// 2. Fix the Titles
html = html.replace(/<h3 class="step-title">CONSULTA<\/h3>/, '<h3 class="step-title">CONSULTORÍA</h3>');
html = html.replace(/<h3 class="step-title">DISE.?O<\/h3>/, '<h3 class="step-title">DESARROLLO Y OPTIMIZACIÓN</h3>');
html = html.replace(/<h3 class="step-title">IMPRESI.?N<\/h3>/, '<h3 class="step-title">MANUFACTURA Y CONTROL</h3>');
html = html.replace(/<h3 class="step-title">ENTREGA<\/h3>/, '<h3 class="step-title">ACABADO Y ENTREGA</h3>');

fs.writeFileSync('index.html', html);
console.log('Fixed titles in process section!');
