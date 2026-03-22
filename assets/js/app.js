// Configuraciones y Estado
const paletas = {
    oficial: { verde: '0, 104, 71', blanco: '255, 255, 255', rojo: '206, 17, 38' },
    pastel: { verde: '119, 191, 163', blanco: '245, 245, 245', rojo: '232, 122, 134' },
    neon: { verde: '0, 255, 51', blanco: '255, 255, 255', rojo: '255, 0, 51' }
};

let estadoApp = {
    paleta: 'oficial',
    formato: 'hex',
    oscuro: false,
    sliders: { verde: 100, blanco: 100, rojo: 100 }
};

// Utilidades de Color
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('').toUpperCase();

const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
};

// Audio y Efectos Visuales
function playPop() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.frequency.setValueAtTime(600, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) { console.log("Audio no soportado"); }
}

function lanzarConfeti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150, spread: 80, origin: { y: 0.6 },
            colors: ['#006847', '#FFFFFF', '#CE1126']
        });
    }
}

// Lógica de Tarjetas
function setupColorCard(idColor) {
    const slider = document.getElementById(`slider-${idColor}`);
    const textElement = document.getElementById(`text-${idColor}`);
    const block = document.getElementById(`block-${idColor}`);
    const pctText = document.getElementById(`pct-${idColor}`);

    const actualizarColor = () => {
        const opacidad = slider.value / 100;
        const rgb = paletas[estadoApp.paleta][idColor];
        const [r, g, b] = rgb.split(',').map(n => n.trim());
        
        pctText.textContent = `${slider.value}%`;
        block.style.backgroundColor = `rgba(${rgb}, ${opacidad})`;

        let textoMostrar = "";
        if (estadoApp.formato === 'hex') {
            textoMostrar = opacidad === 1 ? rgbToHex(r, g, b) : `rgba(${rgb}, ${opacidad})`;
        } else if (estadoApp.formato === 'rgb') {
            textoMostrar = opacidad === 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${opacidad})`;
        } else if (estadoApp.formato === 'hsl') {
            const hsl = rgbToHsl(r, g, b);
            textoMostrar = opacidad === 1 ? `hsl(${hsl})` : `hsla(${hsl}, ${opacidad})`;
        }
        textElement.textContent = textoMostrar;

        if (idColor === 'blanco') {
            const escudo = block.querySelector('.escudo');
            if (escudo) escudo.style.opacity = opacidad;
        }

        estadoApp.sliders[idColor] = slider.value;
        guardarEnMemoria();
    };

    slider.addEventListener('input', actualizarColor);

    textElement.addEventListener('click', () => {
        navigator.clipboard.writeText(textElement.textContent).then(() => {
            playPop(); mostrarToast();
        });
    });

    return actualizarColor;
}

const actualizarVerde = setupColorCard('verde');
const actualizarBlanco = setupColorCard('blanco');
const actualizarRojo = setupColorCard('rojo');

function actualizarTodasLasTarjetas() {
    actualizarVerde(); actualizarBlanco(); actualizarRojo();
}

// Eventos de Interfaz
const btnDarkMode = document.getElementById('btn-dark-mode');
btnDarkMode.addEventListener('click', () => {
    estadoApp.oscuro = !estadoApp.oscuro;
    aplicarModoOscuro();
    guardarEnMemoria();
    playPop();
});

function aplicarModoOscuro() {
    if (estadoApp.oscuro) { document.body.classList.add('dark-mode'); btnDarkMode.textContent = '☀️'; } 
    else { document.body.classList.remove('dark-mode'); btnDarkMode.textContent = '🌙'; }
}

document.getElementById('theme-selector').addEventListener('change', (e) => {
    estadoApp.paleta = e.target.value;
    actualizarTodasLasTarjetas();
    guardarEnMemoria();
    playPop();
});

document.getElementById('btn-format').addEventListener('click', () => {
    if (estadoApp.formato === 'hex') estadoApp.formato = 'rgb';
    else if (estadoApp.formato === 'rgb') estadoApp.formato = 'hsl';
    else estadoApp.formato = 'hex';
    
    actualizarTodasLasTarjetas();
    guardarEnMemoria();
    playPop();
});

document.getElementById('btn-reset').addEventListener('click', () => {
    estadoApp.paleta = 'oficial';
    estadoApp.sliders = { verde: 100, blanco: 100, rojo: 100 };
    document.getElementById('theme-selector').value = 'oficial';
    ['verde', 'blanco', 'rojo'].forEach(color => { document.getElementById(`slider-${color}`).value = 100; });
    
    actualizarTodasLasTarjetas();
    guardarEnMemoria();
    playPop();
    lanzarConfeti();
});

const modal = document.getElementById('export-modal');
document.getElementById('btn-export').addEventListener('click', () => {
    playPop();
    lanzarConfeti();
    const cssText = `:root {\n  --bandera-verde: ${document.getElementById('text-verde').textContent};\n  --bandera-blanco: ${document.getElementById('text-blanco').textContent};\n  --bandera-rojo: ${document.getElementById('text-rojo').textContent};\n}`;
    document.getElementById('css-output').value = cssText;
    modal.classList.add('active');
});

document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.remove('active'));

document.querySelectorAll('.flip-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.target.closest('.glass-card').classList.toggle('flipped'); playPop();
    });
});

function mostrarToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000);
}

// Persistencia de Datos (Local Storage)
function guardarEnMemoria() {
    localStorage.setItem('banderaMexicoApp', JSON.stringify(estadoApp));
}

function cargarDesdeMemoria() {
    const guardado = localStorage.getItem('banderaMexicoApp');
    if (guardado) {
        estadoApp = JSON.parse(guardado);
        document.getElementById('theme-selector').value = estadoApp.paleta;
        ['verde', 'blanco', 'rojo'].forEach(color => {
            document.getElementById(`slider-${color}`).value = estadoApp.sliders[color];
        });
        aplicarModoOscuro();
    }
    actualizarTodasLasTarjetas();
}

// Inicialización
cargarDesdeMemoria();