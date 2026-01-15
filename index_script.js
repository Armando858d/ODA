<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ODA - Servicios Urbans</title>

<!-- Fuentes urbanas -->
<link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Rubik:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="index_estilo.css">

<!-- Lottie (por si quieres animaciones extra) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js"></script>
</head>
<body>

<!-- PARTICULAS DE FONDO -->
<canvas id="particle-canvas"></canvas>

<!-- HEADER / MENU -->
<header>
    <div class="logo">ODA</div>
    <div class="menu-icon" id="menu-icon">&#9776;</div>

    <nav id="nav">
        <ul>
            <li><a href="#inicio">Inicio <span class="emoji">🏠</span></a></li>
            <li><a href="#servicios">Servicios <span class="emoji">🛠️</span></a></li>
            <li><a href="#contacto">Contacto <span class="emoji">📩</span></a></li>
            <li><a href="#soporte" class="btn">Soporte <span class="emoji">💬</span></a></li>
            <li><a href="https://wa.me/521XXXXXXXXXX" target="_blank" class="btn">WhatsApp <span class="emoji">📲</span></a></li>
        </ul>
    </nav>
</header>

<!-- HERO -->
<section id="inicio" class="hero">
    <h1 class="glow">ODA</h1>
    <p class="subtitulo">Servicios urbanos • Estilo callejero</p>
    <button class="btn" onclick="scrollToSection('servicios')">Ver Servicios</button>
</section>

<!-- SERVICIOS -->
<section id="servicios" class="bloque">
    <h2>Servicios</h2>
    <div class="cards">
        <div class="card">
            <img src="img/servicio1.jpg" alt="Publicidad">
            <h3>Publicidad</h3>
            <p>Diseño urbano, banners, redes sociales</p>
        </div>
        <div class="card">
            <img src="img/servicio2.jpg" alt="Renta de autobuses">
            <h3>Renta de autobuses</h3>
            <p>Viajes cómodos y seguros para tours o eventos.</p>
        </div>
    </div>
</section>

<!-- CONTACTO -->
<section id="contacto" class="bloque">
    <h2>Contacto</h2>
    <p>Comunícate con nosotros o manda un mensaje a WhatsApp</p>
    <a href="https://wa.me/521XXXXXXXXXX" target="_blank" class="btn">Enviar mensaje</a>
</section>

<!-- FOOTER -->
<footer>
    &copy; 2026 ODA • Estilo urbano grafitero
</footer>

<!-- JS -->
<script src="index_script.js"></script>
</body>
</html>
