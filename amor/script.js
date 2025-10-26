// ====================================================================
// 1. Setup y Variables Globales
// ====================================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Ajusta el tamaño del canvas al tamaño de la ventana
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Arreglos para los elementos de la animación
const stars = []; // Estrellas de fondo
const heartStars = []; // Estrellas que forman el corazón
const meteors = []; // Estrellas fugaces
const fallingTexts = []; // Mensajes cayendo

// Variables de interacción y animación
let mouseX = width / 2;
let mouseY = height / 2;
let heartBeat = 1; // Para la pulsación del corazón
let heartScale = Math.min(width, height) * 0.015;

// Mensajes traducidos al español para el texto cayendo
const messages = [
    "Eres mi universo",
    "Amor infinito entre las estrellas",
    "Eres la estrella más brillante",
    "Brillo gracias a ti",
    "Realmente brillas en mi cielo"
];


// ====================================================================
// 2. Funciones de Ayuda
// ====================================================================

// Función que define las coordenadas para la forma de un corazón (Cardioide)
function heartShape(t, scale = 1) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
}

// ====================================================================
// 3. Creación de Elementos
// ====================================================================

// 3.1. Creación de texto cayendo
function createFallingText() {
    const text = messages[Math.floor(Math.random() * messages.length)];
    const fontSize = Math.random() * 15 + 15;

    // Medir el texto para centrarlo o posicionarlo correctamente
    ctx.font = `bold ${fontSize}px Pacifico`;
    const textWidth = ctx.measureText(text).width;

    const x = Math.random() * (width - textWidth);

    fallingTexts.push({
        text,
        x,
        y: -10,
        speed: Math.random() * 2 + 2,
        alpha: 1,
        fontSize,
        hue: Math.random() * 360 // Color aleatorio
    });
}

// 3.2. Creación de estrellas de fondo (200)
function createBackgroundStars() {
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            twinkle: Math.random() * Math.PI * 2, // Posición inicial de la fase de parpadeo
            twinkleSpeed: Math.random() * 0.01 + 0.005,
            brightness: Math.random() * 0.3 + 0.2 // Brillo base
        });
    }
}

// 3.3. Creación de estrellas con forma de corazón (1600)
function createHeartStars(count = 1600) {
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const heart = heartShape(t, heartScale);
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;

        const targetX = centerX + heart.x + offsetX;
        const targetY = centerY + heart.y + offsetY;

        heartStars.push({
            x: Math.random() * width, // Comienza en una posición aleatoria
            y: Math.random() * height,
            targetX,
            targetY,
            originalX: targetX,
            originalY: targetY,
            size: Math.random() * 3 + 1,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            brightness: Math.random() * 0.5 + 0.5,
            hue: Math.random() * 60 + 300, // Tonos rosados/púrpuras
            mode: "flying" // Modo inicial: volando hacia la forma
        });
    }
}

// 3.4. Creación de un meteoro (estrella fugaz)
function createMeteor() {
    meteors.push({
        x: Math.random() * width,
        y: -50, // Comienza por encima de la pantalla
        length: Math.random() * 80 + 50,
        speed: Math.random() * 6 + 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // Ángulo diagonal
        alpha: 1
    });
}

// ====================================================================
// 4. Lógica de Audio
// ====================================================================

const music = document.getElementById("bg-music");

function playMusicOnce() {
    music.play().catch(e => console.log("Music play blocked", e));
    // Una vez que el usuario hace click, se elimina el listener
    window.removeEventListener("click", playMusicOnce);
}

// El audio solo se puede iniciar después de una interacción del usuario
window.addEventListener("click", playMusicOnce);


// ====================================================================
// 5. Función de Animación Principal (animate)
// ====================================================================

function animate() {
    // 5.0. Limpiar y Preparar
    ctx.clearRect(0, 0, width, height);
    heartBeat += 0.1; // Incrementa el latido para la pulsación del corazón

    // 5.1. Dibujar Estrellas de Fondo
    stars.forEach(star => {
        star.twinkle += star.twinkleSpeed;

        // Efecto de parpadeo aleatorio
        const flicker = Math.random() < 0.005 ? 1 : 0;
        const baseOpacity = star.brightness * (0.4 + 0.6 * Math.sin(star.twinkle));
        const opacity = Math.min(1, baseOpacity + flicker);

        ctx.globalAlpha = opacity;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = flicker ? 20 : 0;
        ctx.shadowColor = flicker ? '#fff' : 'transparent';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // 5.2. Animación de Meteoros
    meteors.forEach((m, i) => {
        const dx = Math.cos(m.angle) * m.length;
        const dy = Math.sin(m.angle) * m.length;

        ctx.save();
        ctx.globalAlpha = m.alpha;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - dx, m.y - dy);
        ctx.stroke();
        ctx.restore();

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.005; // Desvanece el meteoro

        if (m.alpha <= 0) meteors.splice(i, 1);
    });

    // 5.3. Animación de Texto Cayendo
    fallingTexts.forEach((t, i) => {
        ctx.save();
        ctx.font = `bold ${t.fontSize}px Pacifico`;
        ctx.fillStyle = `hsla(${t.hue}, 100%, 30%, ${t.alpha})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsla(${t.hue}, 100%, 40%, ${t.alpha})`;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();

        t.y += t.speed;
        t.alpha -= 0.002; // Desvanece el texto

        // Eliminar texto si sale de la pantalla o se desvanece
        if (t.y > height + 30 || t.alpha <= 0) {
            fallingTexts.splice(i, 1);
        }
    });

    // 5.4. Animación de Estrellas de Corazón
    heartStars.forEach((star, i) => {
        star.twinkle += star.twinkleSpeed;
        const centerX = width / 2;
        const centerY = height / 2 + 20;

        // Lógica de Movimiento
        if (star.mode === 'flying') {
            // Mover la estrella hacia su posición de destino en el corazón
            const dx = star.targetX - star.x;
            const dy = star.targetY - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 0.07;

            if (dist > 1) {
                star.x += dx * speed;
                star.y += dy * speed;
            } else {
                star.mode = 'heart'; // Cambia a modo latido cuando llega
            }
        } else { // star.mode === 'heart'
            // Aplicar el efecto de latido
            const deltaX = star.originalX - centerX;
            const deltaY = star.originalY - centerY;
            const beatScale = 1 + Math.sin(heartBeat) * 0.05;
            star.x = centerX + deltaX * beatScale;
            star.y = centerY + deltaY * beatScale;
        }

        // Lógica de Interacción con el Ratón
        const distanceToMouse = Math.hypot(mouseX - star.x, mouseY - star.y);
        let interactionForce = 0;
        if (distanceToMouse < 100) {
            interactionForce = (100 - distanceToMouse) / 100;
            const angle = Math.atan2(star.y - mouseY, star.x - mouseX);
            star.x += Math.cos(angle) * interactionForce * 10;
            star.y += Math.sin(angle) * interactionForce * 10;
        }

        // Dibujar la estrella
        const twinkleOpacity = star.brightness * (0.3 + 0.7 * Math.sin(star.twinkle));
        ctx.save();
        ctx.globalAlpha = twinkleOpacity;
        ctx.fillStyle = `hsl(${star.hue}, 70%, 80%)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${star.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Llamada recursiva para el siguiente frame
    requestAnimationFrame(animate);
}

// ====================================================================
// 6. Inicialización y Eventos
// ====================================================================

// 6.1. Inicializar elementos
createBackgroundStars();
createHeartStars();

// 6.2. Intervalo para crear nuevos elementos
setInterval(() => {
    if (Math.random() < 0.8) createFallingText();
}, 2000);

// Crea un meteoro de vez en cuando
setInterval(() => {
    if (Math.random() < 0.5) createMeteor();
}, 5000);


// 6.3. Manejadores de eventos

// Redimensionar el canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    heartScale = Math.min(width, height) * 0.015;
    // (Opcional: Volver a crear el corazón o recalcular posiciones)
});

// Actualizar la posición del ratón
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Evento de click para hacer que el corazón se reajuste o se mueva
canvas.addEventListener('click', (e) => {
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const clickHeartScale = Math.min(width, height) * 0.015; // Reusa la escala actual

    // Reajustar la forma del corazón existente al hacer clic
    heartStars.forEach((star, i) => {
        if (star.mode === 'heart') {
            const t = (i / heartStars.length) * Math.PI * 2;
            const heart = heartShape(t, clickHeartScale);
            const offsetX = (Math.random() - 0.5) * 15;
            const offsetY = (Math.random() - 0.5) * 15;
            star.originalX = centerX + heart.x + offsetX;
            star.originalY = centerY + heart.y + offsetY;
            star.targetX = star.originalX;
            star.targetY = star.originalY;
        }
    });

    // También se puede añadir lógica aquí para crear un pulso o un efecto de explosión

});

// 6.4. Iniciar la animación
animate();