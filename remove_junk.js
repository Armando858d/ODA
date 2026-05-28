const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove hero-description-center block completely
html = html.replace(/<div class="hero-description-center">[\s\S]*?<\/div>\s*<div class="hero-cta-center">/g, '<div class="hero-cta-center">');

// 2. Remove hero-cta-center block completely
html = html.replace(/<div class="hero-cta-center">[\s\S]*?<\/div>\s*<\/div>\s*<!-- RIGHT STATS -->/g, '</div>\n\n        <!-- RIGHT STATS -->');

// 3. Remove scroll indicator completely
html = html.replace(/<div class="scroll-indicator" aria-hidden="true">[\s\S]*?<\/div>\s*<\/section>/g, '</section>');

fs.writeFileSync('index.html', html);
console.log('Removed unwanted hero elements from HTML.');
