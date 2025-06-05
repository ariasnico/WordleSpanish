const palabras = [
    'GATOS', 'PERRO', 'LIBRO', 'VERDE', 'PLATO',
    'CARRO', 'PLAYA', 'FUEGO', 'CIELO', 'MUNDO',
    'PAPEL', 'RELOJ', 'CAMPO', 'DULCE', 'AUDIO',
    'CAFES', 'ARBOL', 'PARED', 'BOTAS', 'NUBES',
    'CARTA', 'SUELO', 'CABLE', 'VIAJE', 'TIGRE',
    'LUCES', 'VASOS', 'FLOTA', 'HELIO', 'BAILE',
    'RISAS', 'TORRE', 'SOLAR', 'VISTA', 'CEBRA',
    'FRUTA', 'PIANO', 'SILLA', 'FALDA', 'GOLPE',
    'LAPIZ', 'SALTA', 'BRISA', 'TEXTO', 'HOJAS',
    'VIDEO', 'JUEGO', 'LUCHA', 'AVION', 'CAJAS',
    'TECHO', 'SABOR', 'TARTA', 'SABIA',
    'NIEVE', 'LENTO', 'SALON', 'RUEDA', 'BESOS',
    'ANGEL', 'PUNTO', 'CANTO', 'TAMBO', 'MALTA',
    'ALMAS', 'FOTOS', 'PISTA', 'CABRA', 'GEMAS',
    'FIRMA', 'HUEVO', 'CUERO', 'TAPAS', 'COPAS',
    'TRIPA', 'HIELO', 'CUOTA', 'BICHO', 'SORBO',
    'GIRAS', 'GARRA', 'ZORRO', 'VIUDO', 'CUEVA',
    'LOBOS', 'RATAS', 'CRUCE', 'BOLAS', 'LAGOS',
    'HILOS', 'COSTA', 'JUNIO', 'ROCAS', 'LECHE',
    'CAMAS', 'PECES', 'PILAR', 'MIRAR'
];

// Variables globales
let palabraObjetivo;
let intentoActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let esperandoNuevoJuego = false;
let procesando = false;
let tecladoVirtual = {};
let racha = 0;
let temaActual = 'light';

// Configuración del teclado
const TECLADO_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
];

// Función para verificar si una palabra contiene tildes
function contieneTildes(palabra) {
    const regexTildes = /[\u0300-\u036f]/;
    return regexTildes.test(palabra.normalize('NFD'));
}

// Mapeo de palabras sin tilde a su versión correcta con tilde
const palabrasConTilde = {
    'arbol': 'árbol',
    'angel': 'ángel',
    'lapiz': 'lápiz',
};

// Verificar si una palabra existe en el diccionario y es en español usando Wiktionary API
async function verificarPalabraEnDiccionario(palabra) {
    try {
        const palabraMinuscula = palabra.toLowerCase();
        let paginaFinal = palabraMinuscula;

        // Primero intentar con la palabra exacta como está
        let encodedPaginaFinal = encodeURIComponent(paginaFinal);
        let parseUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodedPaginaFinal}&prop=wikitext&format=json&origin=*`;
        let parseResponse = await fetch(parseUrl);
        let parseData = await parseResponse.json();
        
        if (parseData.parse && parseData.parse.wikitext) {
            const wikitext = parseData.parse.wikitext['*'];
            console.log('Wikitext para', paginaFinal, ':', wikitext);
            console.log('URL de parse:', parseUrl);
            
            const wikitextLower = wikitext.toLowerCase();
            if (wikitextLower.includes('==spanish==') || wikitextLower.includes('==español==')) {
                console.log('Contiene sección Spanish/Español:', true);
                return true;
            }
        }

        // Si no se encontró, buscar en el mapeo de palabras con tilde
        if (palabrasConTilde[palabraMinuscula]) {
            paginaFinal = palabrasConTilde[palabraMinuscula];
            encodedPaginaFinal = encodeURIComponent(paginaFinal);
            parseUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodedPaginaFinal}&prop=wikitext&format=json&origin=*`;
            parseResponse = await fetch(parseUrl);
            parseData = await parseResponse.json();

            if (parseData.parse && parseData.parse.wikitext) {
                const wikitext = parseData.parse.wikitext['*'];
                console.log('Wikitext para versión con tilde', paginaFinal, ':', wikitext);
                console.log('URL de parse:', parseUrl);
                
                const wikitextLower = wikitext.toLowerCase();
                const tieneSeccionEspanol = wikitextLower.includes('==spanish==') || wikitextLower.includes('==español==');
                console.log('Contiene sección Spanish/Español (versión con tilde):', tieneSeccionEspanol);
                return tieneSeccionEspanol;
            }
        }

        // Si aún no se encuentra, intentar con todas las vocales con tilde
        if (!contieneTildes(palabraMinuscula)) {
            const vocalesConTilde = {
                'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú'
            };
            
            // Intentar con cada vocal
            for (const [vocal, vocalTilde] of Object.entries(vocalesConTilde)) {
                if (palabraMinuscula.includes(vocal)) {
                    const palabraConTilde = palabraMinuscula.replace(vocal, vocalTilde);
                    encodedPaginaFinal = encodeURIComponent(palabraConTilde);
                    parseUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodedPaginaFinal}&prop=wikitext&format=json&origin=*`;
                    parseResponse = await fetch(parseUrl);
                    parseData = await parseResponse.json();

                    if (parseData.parse && parseData.parse.wikitext) {
                        const wikitext = parseData.parse.wikitext['*'];
                        console.log('Wikitext para versión con tilde en', vocal, ':', wikitext);
                        
                        const wikitextLower = wikitext.toLowerCase();
                        if (wikitextLower.includes('==spanish==') || wikitextLower.includes('==español==')) {
                            console.log('Encontrada versión válida con tilde en', vocal);
                            return true;
                        }
                    }
                }
            }
        }

        console.log('No se encontró una versión válida de la palabra');
        return false;
    } catch (error) {
        console.error('Error al verificar la palabra:', error);
        return false;
    }
}

// Verificar si una palabra contiene la letra ñ
function contieneÑ(palabra) {
    return palabra.toLowerCase().includes('ñ');
}

// Función para codificar en base64
function codificarPalabra(palabra) {
    try {
        return btoa(palabra);
    } catch (e) {
        return '******';
    }
}

// Función para decodificar base64
function decodificarPalabra(palabraCodificada) {
    try {
        return atob(palabraCodificada);
    } catch (e) {
        return '******';
    }
}

// Inicializar palabra objetivo
function inicializarPalabraObjetivo() {
    palabraObjetivo = palabras[Math.floor(Math.random() * palabras.length)];
    console.log("Palabra objetivo (codificada):", codificarPalabra(palabraObjetivo));
}

// Reiniciar juego
function reiniciarJuego() {
    const tablero = document.getElementById('game-board');
    tablero.innerHTML = '';
    
    intentoActual = 0;
    letraActual = 0;
    juegoTerminado = false;
    esperandoNuevoJuego = false;
    procesando = false;
    
    crearTablero();
    inicializarPalabraObjetivo();
    actualizarRacha();
    
    // Resetear el teclado virtual
    Object.values(tecladoVirtual).forEach(tecla => {
        if (!tecla.classList.contains('wide')) {
            tecla.className = 'key';
        } else {
            tecla.className = 'key wide';
        }
    });
    
    document.getElementById('mensaje').textContent = '';
    document.getElementById('racha').classList.remove('hidden');
}

// Crear el tablero de juego
function crearTablero() {
    const tablero = document.getElementById('game-board');
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        
        tablero.appendChild(row);
    }
}

// Crear el teclado virtual
function crearTecladoVirtual() {
    const keyboard = document.getElementById('virtual-keyboard');
    keyboard.innerHTML = '';

    TECLADO_LAYOUT.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';

        row.forEach(key => {
            const button = document.createElement('button');
            button.className = 'key';
            button.textContent = key;
            
            if (key === 'ENTER' || key === '←') {
                button.classList.add('wide');
            }

            button.addEventListener('click', () => {
                let keyValue = key;
                if (key === '←') {
                    keyValue = 'Backspace';
                }
                manejarTecla(keyValue);
            });

            tecladoVirtual[key] = button;
            keyboardRow.appendChild(button);
        });

        keyboard.appendChild(keyboardRow);
    });
}

// Actualizar el estado visual del teclado
function actualizarTecladoVirtual(palabra, resultados) {
    for (let i = 0; i < palabra.length; i++) {
        const letra = palabra[i].toUpperCase();
        const resultado = resultados[i];
        const tecla = tecladoVirtual[letra];

        if (tecla) {
            if (resultado === 'correct') {
                tecla.className = 'key correct';
            } else if (resultado === 'wrong-position' && !tecla.classList.contains('correct')) {
                tecla.className = 'key wrong-position';
            } else if (resultado === 'incorrect' && !tecla.classList.contains('correct') && !tecla.classList.contains('wrong-position')) {
                tecla.className = 'key incorrect';
            }
        }
    }
}

// Verificar la palabra ingresada
async function verificarPalabra() {
    if (procesando) return;
    procesando = true;

    console.log('Iniciando verificación de palabra, intento:', intentoActual);

    const row = document.querySelector(`.row:nth-child(${intentoActual + 1})`);
    const tiles = row.querySelectorAll('.tile');
    let palabra = '';
    
    tiles.forEach(tile => {
        palabra += tile.textContent;
        tile.classList.remove('active');
    });

    console.log('Palabra formada:', codificarPalabra(palabra));

    if (palabra.length !== 5) {
        console.log('Error: La palabra no tiene 5 letras');
        mostrarMensaje('¡La palabra debe tener 5 letras!');
        sacudirFila();
        procesando = false;
        return;
    }

    if (contieneÑ(palabra)) {
        console.log('Error: La palabra contiene Ñ');
        mostrarMensaje('¡La palabra no puede contener la letra Ñ!');
        sacudirFila();
        procesando = false;
        return;
    }

    // Verificar si la palabra existe en el diccionario y es en español
    const palabraExiste = await verificarPalabraEnDiccionario(palabra);
    console.log('Palabra ingresada:', palabra, '¿Existe?:', palabraExiste);

    if (!palabraExiste) {
        console.log('Error: La palabra no existe en el diccionario o no es en español');
        mostrarMensaje('¡La palabra no existe en el diccionario o no es en español!');
        sacudirFila();
        procesando = false;
        return;
    }

    console.log('Palabra válida, procediendo a verificar letras...');

    // Verificar cada letra
    const letrasRestantes = {};
    [...palabraObjetivo].forEach(letra => {
        letrasRestantes[letra] = (letrasRestantes[letra] || 0) + 1;
    });

    const resultados = new Array(5).fill('incorrect');
    
    for (let i = 0; i < 5; i++) {
        if (palabra[i] === palabraObjetivo[i]) {
            resultados[i] = 'correct';
            letrasRestantes[palabra[i]]--;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (resultados[i] !== 'correct' && letrasRestantes[palabra[i]] > 0) {
            resultados[i] = 'wrong-position';
            letrasRestantes[palabra[i]]--;
        }
    }

    console.log('Resultados:', resultados);
    console.log('Palabra objetivo:', palabraObjetivo);

    // Aplicar animaciones de revelado secuenciales
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const tile = tiles[i];
            
            // Agregar clase de resultado y animación
            tile.classList.add(resultados[i]);
            tile.classList.add('revealed');
            
            console.log(`Ficha ${i} revelada:`, resultados[i]);
            
            // Remover la clase de animación después de que termine
            setTimeout(() => {
                tile.classList.remove('revealed');
            }, 800);
            
        }, i * 200);
    }

    actualizarTecladoVirtual(palabra, resultados);

    // Esperar a que terminen las animaciones
    await new Promise(resolve => setTimeout(resolve, 1300));

    if (palabra === palabraObjetivo) {
        racha++;
        actualizarRacha();
        celebrarRacha();
        await new Promise(resolve => setTimeout(() => {
            mostrarMensaje('¡Felicitaciones! ¡Has ganado!');
            mostrarMensajeContinuar();
            juegoTerminado = true;
            esperandoNuevoJuego = true;
            procesando = false;
            resolve();
        }, 600));
    } else if (intentoActual === 5) {
        racha = 0;
        actualizarRacha();
        await new Promise(resolve => setTimeout(() => {
            mostrarMensaje(`¡Juego terminado! La palabra era: ${palabraObjetivo}`);
            mostrarMensajeContinuar();
            juegoTerminado = true;
            esperandoNuevoJuego = true;
            procesando = false;
            resolve();
        }, 600));
    } else {
        intentoActual++;
        letraActual = 0;
        procesando = false;
    }
}

// Manejar entrada de teclado
function manejarTecla(key) {
    if (procesando) return;

    if (esperandoNuevoJuego) {
        reiniciarJuego();
        return;
    }
    
    if (juegoTerminado) return;

    if (key === 'Enter' || key === 'ENTER') {
        if (letraActual === 5) {
            verificarPalabra().catch(error => {
                console.error('Error al verificar la palabra:', error);
                mostrarMensaje('Error al verificar la palabra. Intenta de nuevo.');
                procesando = false;
            });
            return;
        } else {
            mostrarMensaje('¡La palabra debe tener 5 letras!');
            sacudirFila();
            return;
        }
    }

    if (key === 'Backspace' || key === '←') {
        if (letraActual > 0) {
            letraActual--;
            const tile = document.querySelector(`.row:nth-child(${intentoActual + 1}) .tile:nth-child(${letraActual + 1})`);
            tile.textContent = '';
            tile.classList.remove('pop');
            tile.classList.remove('active');
        }
        return;
    }

    if (letraActual < 5 && /^[A-Za-zÁÉÍÓÚáéíóúÜü]$/.test(key)) {
        const tile = document.querySelector(`.row:nth-child(${intentoActual + 1}) .tile:nth-child(${letraActual + 1})`);
        tile.textContent = key.toUpperCase();
        tile.classList.add('pop');
        tile.classList.add('active');
        letraActual++;
    }
}

// Sacudir la fila actual cuando hay un error
function sacudirFila() {
    const row = document.querySelector(`.row:nth-child(${intentoActual + 1})`);
    const tiles = row.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.add('shake');
        setTimeout(() => {
            tile.classList.remove('shake');
        }, 500);
    });
}

function mostrarMensaje(texto) {
    const mensaje = document.getElementById('mensaje');
    const rachaElement = document.getElementById('racha');
    
    mensaje.textContent = texto;
    
    // Limpiar cualquier timeout previo
    if (window.mensajeTimeout) {
        clearTimeout(window.mensajeTimeout);
    }
    
    // Si es un mensaje de error, hacer que la racha se desvanezca y aparezca el mensaje
    if (texto.includes('no existe') || texto.includes('debe tener') || texto.includes('no puede contener') || texto.includes('Error al verificar')) {
        rachaElement.classList.add('hidden');
        
        window.mensajeTimeout = setTimeout(() => {
            mensaje.textContent = '';
            rachaElement.classList.remove('hidden');
        }, 3000);
    }
}

function mostrarMensajeContinuar() {
    const mensaje = document.getElementById('mensaje');
    const continueMsg = document.createElement('div');
    continueMsg.className = 'continue-message';
    continueMsg.textContent = 'Presiona cualquier tecla para jugar de nuevo';
    mensaje.appendChild(continueMsg);
}

function actualizarRacha() {
    const rachaElement = document.getElementById('racha');
    rachaElement.innerHTML = `Racha: ${racha}<span class="fire-emoji">🔥</span>`;
}

function celebrarRacha() {
    const fireEmoji = document.querySelector('.fire-emoji');
    if (fireEmoji) {
        fireEmoji.classList.add('celebrate');
        setTimeout(() => {
            fireEmoji.classList.remove('celebrate');
        }, 1500);
    }
}

// Función para cargar tema desde localStorage
function cargarTema() {
    const temaGuardado = localStorage.getItem('wordle-theme');
    if (temaGuardado) {
        temaActual = temaGuardado;
    } else {
        // Por defecto siempre usar tema claro
        temaActual = 'light';
    }
    aplicarTema();
}

// Función para aplicar el tema
function aplicarTema() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (temaActual === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }
}

// Función para alternar tema
function alternarTema() {
    temaActual = temaActual === 'light' ? 'dark' : 'light';
    aplicarTema();
    localStorage.setItem('wordle-theme', temaActual);
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    cargarTema();
    inicializarPalabraObjetivo();
    crearTablero();
    crearTecladoVirtual();
    actualizarRacha();
    
    // Agregar event listener para el botón de tema
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', alternarTema);
    
    document.addEventListener('keydown', (e) => {
        manejarTecla(e.key);
    });
});