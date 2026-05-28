# 4RTB4N STUDIO - Diseño y Fabricación Digital ⚡

Sitio web oficial y herramientas internas para 4RTB4N STUDIO, una agencia de impresión 3D premium en Aguascalientes.

## 🚀 Características

### 🌐 Sitio Web (Landing Page)
- Diseño **Cyber/Future** con animaciones GSAP.
- Loader interactivo (Impresora 3D CSS).
- Galería de proyectos tipo "Netflix/Nike" fullscreen.
- Optimizado para móviles y escritorio (Totalmente Responsivo).

### 🧮 Calculadora de Cotizaciones (Interna)
- **Acceso Seguro**: Protección por contraseña (Hash Base64).
- **Cálculo Preciso**: Material, tiempo, depreciación, mano de obra y riesgo.
- **Modo Oscuro**: Interfaz diseñada para uso prolongado.
- **Cotizaciones PDF**: Generación de documentos formales con logo y folio.
- **Integración WhatsApp**: Envío directo de resumen de cotización.

## 🛠️ Tecnologías
- **Frontend**: HTML5, CSS3 (Variables, Grid, Flexbox), Vanilla JS.
- **Librerías**: 
  - [GSAP](https://greensock.com/gsap/) (Animaciones).
  - [jsPDF](https://github.com/parallax/jsPDF) (Generación de PDFs).
  - [FontAwesome](https://fontawesome.com) (Iconos).
- **Seguridad**: Autenticación cliente-servidor (simulada) para herramientas internas.

## 📂 Estructura del Proyecto

```
/4RTB4N
├── assets/          # Imágenes y videos (optimizados)
├── css/             # Estilos modulares
├── js/              # Lógica de negocio y animación
├── index.html       # Landing page pública
├── proyectos.html   # Galería de trabajos
└── calculadora.html # Herramienta de cotización (Protegida)
```


## 🔒 Acceso a Calculadora
> [!WARNING]
> **Nota de Seguridad**: La autenticación actual es básica (lado del cliente) y solo para propósitos demostrativos o de uso interno de baja seguridad. No almacenar datos sensibles.

La herramienta de calculadora require una clave de acceso (uso interno).


---
© 2024-2026 4RTB4N STUDIO. Todos los derechos reservados.
