// Obtener referencias a los elementos
const greenSlider = document.getElementById('greenSlider');
const redSlider = document.getElementById('redSlider');
const greenBox = document.getElementById('greenBox');
const redBox = document.getElementById('redBox');
const greenHex = document.getElementById('greenHex');
const redHex = document.getElementById('redHex');

// Función para actualizar el color del recuadro y el valor hexadecimal
function updateColor(slider, box, hex, color) {
    const value = parseInt(slider.value).toString(16).padStart(2, '0');
    const hexColor = color === 'green' ? `#${value}FF00` : `#FF${value}00`;
    box.style.backgroundColor = hexColor;
    hex.textContent = hexColor;
}

// Evento para actualizar el verde
greenSlider.addEventListener('input', () => {
    updateColor(greenSlider, greenBox, greenHex, 'green');
});

// Evento para actualizar el rojo
redSlider.addEventListener('input', () => {
    updateColor(redSlider, redBox, redHex, 'red');
});
