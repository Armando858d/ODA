const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newHTML = `
        <div class="services-grid">
          <!-- Card 1: Manufactura Digital -->
          <article class="service-card">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-print"></i>
                <div class="icon-pulse"></div>
              </div>
              <h3 class="card-title">1. Manufactura Digital</h3>
              <div class="card-tag">
                <span class="tag-text">PREMIUM</span>
              </div>
            </div>

            <div class="card-content">
              <div class="card-features">
                <span class="feature">Alta Resistencia</span>
                <span class="feature">Multi-Material</span>
                <span class="feature">Producción a Escala</span>
              </div>

              <p class="card-description">
                Materialización de piezas y figuras mediante fabricación digital. Garantizamos integridad estructural, tolerancias precisas y versatilidad de polímeros para proyectos que exigen grado industrial y comercial.
              </p>

              <div class="card-specs">
                <div class="spec">
                  <div class="spec-value">Funcional</div>
                  <div class="spec-label">Industrial</div>
                </div>
                <div class="spec">
                  <div class="spec-value">Producción</div>
                  <div class="spec-label">Escala</div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <a href="#contacto" class="card-link">
                <span>Solicitar cotización</span>
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>

            <div class="card-glow" aria-hidden="true"></div>
          </article>

          <!-- Card 2: Ingeniería y Modelado 3D -->
          <article class="service-card featured">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-cube"></i>
                <div class="icon-pulse"></div>
              </div>
              <h3 class="card-title">2. Ingeniería y Modelado 3D</h3>
              <div class="card-tag">
                <span class="tag-text">MÁS SOLICITADO</span>
              </div>
            </div>

            <div class="card-content">
              <div class="card-features">
                <span class="feature">SolidWorks</span>
                <span class="feature">Blender</span>
                <span class="feature">Paramétrico</span>
                <span class="feature">Orgánico</span>
              </div>

              <p class="card-description">
                Diseño tridimensional a la medida: desde la conceptualización desde cero hasta archivos listos para producción. Modelado mecánico, optimización de geometrías y desarrollo de soluciones técnicas.
              </p>

              <div class="card-specs">
                <div class="spec">
                  <div class="spec-value">Desarrollo</div>
                  <div class="spec-label">Precisión</div>
                </div>
                <div class="spec">
                  <div class="spec-value">3D</div>
                  <div class="spec-label">Prototipado</div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <a href="proyectos.html" class="card-link">
                <span>Ver portafolio</span>
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>
            
            <div class="card-glow" aria-hidden="true"></div>
          </article>

          <!-- Card 3: Acabados de Exhibición y Arte Manual -->
          <article class="service-card">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-paint-brush"></i>
                <div class="icon-pulse"></div>
              </div>
              <h3 class="card-title">3. Acabados de Exhibición y Arte Manual</h3>
              <div class="card-tag">
                <span class="tag-text">EXCLUSIVO</span>
              </div>
            </div>

            <div class="card-content">
              <div class="card-features">
                <span class="feature">Superficies Lisas</span>
                <span class="feature">Pintura a Mano</span>
                <span class="feature">Resina y Acrílico</span>
              </div>

              <p class="card-description">
                Acabados idénticos a la inyección de plástico. Tratamiento de superficies para eliminar texturas, logrando piezas completamente lisas, coronadas con pintura artesanal de precisión y recubrimientos brillantes para un nivel de exhibición impecable.
              </p>

              <div class="card-specs">
                <div class="spec">
                  <div class="spec-value">Detalle</div>
                  <div class="spec-label">Coleccionismo</div>
                </div>
                <div class="spec">
                  <div class="spec-value">Arte</div>
                  <div class="spec-label">Intervención</div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <a href="#contacto" class="card-link">
                <span>Solicitar acabado</span>
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>

            <div class="card-glow" aria-hidden="true"></div>
          </article>
        </div>`;

// Replace everything between <div class="services-grid"> and </div>\s+</div>\s+</section>
html = html.replace(/<div class="services-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, newHTML + '\n      </div>\n    </section>');

fs.writeFileSync('index.html', html);
console.log('Updated services section!');
