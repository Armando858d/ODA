const fs = require('fs');
const path = require('path');

const targetFilesHTMLJS = [
    'index.html',
    'proyectos.html',
    'calculadora.html',
    'js/calculadora.js'
];

const cssFiles = [
    'css/index_estilo.css'
];

const readmeFile = 'README.md';

function processHTMLJS(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 4. Replace "STUDIO 3D" with "4RTB4N" in index.html line 129
    if (filePath === 'index.html') {
        content = content.replace(/<div class="tagline">STUDIO 3D<\/div>/g, '<div class="tagline">4RTB4N</div>');
    }

    // 3. Replace oda.png with logo.png
    content = content.replace(/oda\.png/g, 'logo.png');

    // 1 & 2. Replace visible instances of "ODA" with "4RTB4N", preserving "oda-wrap", "oda_auth", etc.
    // The requirement says DO NOT change CSS class names like "oda-wrap" or code variables like "oda_auth".
    // "ODA" in uppercase is what we want to replace.
    // Let's replace "ODA" exactly, since CSS classes and JS variables are usually lowercase ("oda-wrap", "oda_auth").
    // If there is "ODA" in uppercase, it's a visible instance or URL.
    // WhatsApp links use "Hola%20ODA" -> "Hola%204RTB4N".
    content = content.replace(/ODA/g, '4RTB4N');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

function processCSS(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 3. Replace oda.png with logo.png in CSS
    content = content.replace(/oda\.png/g, 'logo.png');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

function processReadme(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 5. Replace ODA with 4RTB4N in README.md
    content = content.replace(/ODA/g, '4RTB4N');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

targetFilesHTMLJS.forEach(processHTMLJS);
cssFiles.forEach(processCSS);
processReadme(readmeFile);
