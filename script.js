// Configuración de Auth0 (ahora viene de config.js)
const AUTH0_CONFIG = CONFIG.AUTH0;

// ========== CONSTANTES DEL JUEGO ==========
const PALABRA_LENGTH = 5;
const MAX_INTENTOS = 6;
const TECLADO_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
];

// Mapeo de palabras sin tilde a su versión correcta con tilde
const PALABRAS_CON_TILDE = {
    'arbol': 'árbol',
    'angel': 'ángel',
    'lapiz': 'lápiz',
};

// Lista de palabras del juego
const PALABRAS = [
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

// ========== VARIABLES GLOBALES ==========
// Variables de autenticación
let auth0Client = null;
let usuario = null;
let usuarioStats = {
    maxStreak: 0,
    gamesPlayed: 0,
    currentStreak: 0
};
let modoInvitado = false;

// Variables del juego
let palabraObjetivo; // Esta variable se protegerá en producción
let intentoActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let esperandoNuevoJuego = false;
let procesando = false;
let tecladoVirtual = {};
let racha = 0;
let temaActual = 'light';

// ========== FUNCIONES AUXILIARES ==========

// Función para verificar si una palabra contiene tildes
function contieneTildes(palabra) {
    const regexTildes = /[\u0300-\u036f]/;
    return regexTildes.test(palabra.normalize('NFD'));
}

// Verificar si una palabra existe en el diccionario y es en español usando Wiktionary API
async function verificarPalabraEnDiccionario(palabra) {
    try {
        const palabraMinuscula = palabra.toLowerCase();
        
        // Lista de variantes a probar
        const variantes = [
            palabraMinuscula, // Palabra original
            PALABRAS_CON_TILDE[palabraMinuscula] // Mapeo específico
        ].filter(Boolean); // Eliminar undefined
        
        // Generar variantes con tildes si no las tiene
        if (!contieneTildes(palabraMinuscula)) {
            const vocalesConTilde = { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú' };
            
            for (const [vocal, vocalTilde] of Object.entries(vocalesConTilde)) {
                if (palabraMinuscula.includes(vocal)) {
                    variantes.push(palabraMinuscula.replace(vocal, vocalTilde));
                }
            }
        }
        
        // Verificar cada variante
        for (const variante of variantes) {
            const esValida = await verificarVarianteEnWiktionary(variante);
            if (esValida) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error al verificar la palabra:', error);
        return false;
    }
}

// Función auxiliar para verificar una variante específica en Wiktionary
async function verificarVarianteEnWiktionary(palabra) {
    try {
        const encodedPalabra = encodeURIComponent(palabra);
        const parseUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodedPalabra}&prop=wikitext&format=json&origin=*`;
        
        const response = await fetch(parseUrl);
        const data = await response.json();
        
        if (data.parse && data.parse.wikitext) {
            const wikitext = data.parse.wikitext['*'].toLowerCase();
            return wikitext.includes('==spanish==') || wikitext.includes('==español==');
        }
        
        return false;
    } catch (error) {
        console.error(`Error al verificar variante "${palabra}":`, error);
        return false;
    }
}

// Verificar si una palabra contiene la letra ñ
function contieneÑ(palabra) {
    return palabra.toLowerCase().includes('ñ');
}

// Función para codificar en base64 (solo para desarrollo)
function codificarPalabra(palabra) {
    try {
        return btoa(palabra);
    } catch (e) {
        return '******';
    }
}

// Función para decodificar base64 (solo para desarrollo)
function decodificarPalabra(palabraCodificada) {
    try {
        return atob(palabraCodificada);
    } catch (e) {
        return '******';
    }
}

// Sistema anti-trampa: deshabilitar DevTools en producción (mejorado para móviles)
function antiTrampa() {
    // Solo activar en producción
    if (!CONFIG.isProduction) {
        return; // No hacer nada en desarrollo
    }

    // Detectar si estamos en móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || 
                     'ontouchstart' in window;

    // Deshabilitar console completamente en producción
    const noop = () => {};
    const consoleMethods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'table', 'group', 'groupEnd', 'clear', 'time', 'timeEnd'];
    
    const disabledConsole = {};
    consoleMethods.forEach(method => {
        disabledConsole[method] = noop;
    });
    window.console = disabledConsole;
    
    // Proteger variables globales críticas
    try {
        Object.defineProperty(window, 'palabraObjetivo', {
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: false
        });
    } catch (e) {
        // Silenciar errores en producción
    }
    
    // Solo detectar DevTools en DESKTOP - evitar falsos positivos en móviles
    if (!isMobile) {
        let devtools = { open: false };
        const DEVTOOLS_THRESHOLD = 200; // Aumentado para evitar falsos positivos
        const WARNING_HTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f44336;color:white;font-family:Arial,sans-serif;text-align:center;">
                <h1 style="font-size:3em;margin:0;">🚫 ANTI-TRAMPA 🚫</h1>
                <p style="font-size:1.5em;">Cierra las herramientas de desarrollador</p>
                <p style="font-size:1em;opacity:0.8;">El juego se reiniciará automáticamente</p>
            </div>
        `;
        
        // Variables para detección más inteligente
        let initialOuterHeight = window.outerHeight;
        let initialOuterWidth = window.outerWidth;
        let stableCount = 0;
        
        const detectDevTools = () => {
            const heightDiff = window.outerHeight - window.innerHeight;
            const widthDiff = window.outerWidth - window.innerWidth;
            
            // Ignorar cambios menores de tamaño (zoom, barra de direcciones, etc.)
            const heightChanged = Math.abs(window.outerHeight - initialOuterHeight) > 50;
            const widthChanged = Math.abs(window.outerWidth - initialOuterWidth) > 50;
            
            // Solo detectar si es un cambio significativo Y consistente
            if ((heightDiff > DEVTOOLS_THRESHOLD || widthDiff > DEVTOOLS_THRESHOLD) && 
                !heightChanged && !widthChanged) {
                stableCount++;
                
                // Requiere detección estable por 3 intervalos consecutivos
                if (stableCount >= 3 && !devtools.open) {
                    devtools.open = true;
                    document.body.innerHTML = WARNING_HTML;
                }
            } else {
                stableCount = 0;
                if (devtools.open && heightDiff < 100 && widthDiff < 100) {
                    devtools.open = false;
                    window.location.reload();
                }
            }
        };
        
        // Verificar cada 200ms (menos agresivo)
        let detectionInterval = setInterval(detectDevTools, 200);
        
        // Limpiar interval si la página se descarga
        window.addEventListener('beforeunload', () => {
            if (detectionInterval) {
                clearInterval(detectionInterval);
            }
        });
    }
    
    // Deshabilitar teclas peligrosas (solo en desktop)
    if (!isMobile) {
        const BLOCKED_KEYS = ['F12'];
        const BLOCKED_COMBOS = [
            { ctrl: true, shift: true, key: 'I' },
            { ctrl: true, shift: true, key: 'J' },
            { ctrl: true, key: 'U' }
        ];
        
        const keyHandler = (e) => {
            // Verificar teclas individuales
            if (BLOCKED_KEYS.includes(e.key)) {
                e.preventDefault();
                document.body.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f44336;color:white;font-family:Arial,sans-serif;text-align:center;">
                        <h1 style="font-size:3em;margin:0;">🚫 NO HAGAS TRAMPA 🚫</h1>
                        <p style="font-size:1.5em;">Teclas de desarrollador deshabilitadas</p>
                    </div>
                `;
                return;
            }
            
            // Verificar combinaciones
            for (const combo of BLOCKED_COMBOS) {
                if ((!combo.ctrl || e.ctrlKey) && 
                    (!combo.shift || e.shiftKey) && 
                    (!combo.alt || e.altKey) && 
                    e.key === combo.key) {
                    e.preventDefault();
                    document.body.innerHTML = `
                        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f44336;color:white;font-family:Arial,sans-serif;text-align:center;">
                            <h1 style="font-size:3em;margin:0;">🚫 ANTI-TRAMPA 🚫</h1>
                            <p style="font-size:1.5em;">Cierra las herramientas de desarrollador</p>
                            <p style="font-size:1em;opacity:0.8;">El juego se reiniciará automáticamente</p>
                        </div>
                    `;
                    return;
                }
            }
        };
        
        document.addEventListener('keydown', keyHandler, { passive: false });
    }
    
    // Click derecho deshabilitado en todos los dispositivos
    document.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });
}

// Inicializar palabra objetivo
function inicializarPalabraObjetivo() {
    palabraObjetivo = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    
    // Solo mostrar en desarrollo
    if (CONFIG.environment === 'development') {
        console.log("🎯 Nueva palabra generada (desarrollo)");
        console.log("📝 Palabra objetivo (codificada):", codificarPalabra(palabraObjetivo));
    }
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
    
    for (let i = 0; i < MAX_INTENTOS; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < PALABRA_LENGTH; j++) {
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

    // console.log('Palabra formada:', codificarPalabra(palabra)); // REMOVIDO: Anti-trampa

    if (palabra.length !== PALABRA_LENGTH) {
        console.log('Error: La palabra no tiene la longitud correcta');
        mostrarMensaje(`¡La palabra debe tener ${PALABRA_LENGTH} letras!`);
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

    // Solo logs seguros en desarrollo
    if (CONFIG.environment === 'development') {
        console.log('🎯 Resultados del intento:', resultados);
        console.log('📝 Comparando con:', codificarPalabra(palabraObjetivo));
    }

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
        manejarFinJuego(true);
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
        manejarFinJuego(false);
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
        if (letraActual === PALABRA_LENGTH) {
            verificarPalabra().catch(error => {
                console.error('Error al verificar la palabra:', error);
                mostrarMensaje('Error al verificar la palabra. Intenta de nuevo.');
                procesando = false;
            });
            return;
        } else {
            mostrarMensaje(`¡La palabra debe tener ${PALABRA_LENGTH} letras!`);
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

    if (letraActual < PALABRA_LENGTH && /^[A-Za-zÁÉÍÓÚáéíóúÜü]$/.test(key)) {
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
    actualizarRachaConStats();
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

// ========== FUNCIONES DE AUTENTICACIÓN ==========

// Inicializar Auth0 para sistema global
async function inicializarAuth0() {
    try {
        console.log('🌍 Inicializando Auth0 para sistema global...');
        console.log('🔧 Configuración Auth0:', AUTH0_CONFIG);
        
        // Verificar que Auth0 SDK esté disponible con múltiples intentos
        if (typeof auth0 === 'undefined') {
            console.log('⏳ Auth0 SDK no detectado inmediatamente, esperando...');
            
            // Esperar hasta 10 segundos para que se cargue Auth0
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (typeof auth0 !== 'undefined') {
                    console.log('✅ Auth0 SDK detectado después de esperar');
                    break;
                }
            }
            
            if (typeof auth0 === 'undefined') {
                throw new Error('Auth0 SDK no está disponible después de múltiples intentos.');
            }
        }
        
        auth0Client = await auth0.createAuth0Client(AUTH0_CONFIG);
        console.log('✅ Auth0 inicializado correctamente');
        
        // Verificar si ya hay una sesión activa
        const isAuthenticated = await auth0Client.isAuthenticated();
        console.log('🔐 Usuario autenticado:', isAuthenticated);
        
        if (isAuthenticated) {
            usuario = await auth0Client.getUser();
            console.log('👤 Usuario obtenido:', usuario);
            await cargarEstadisticasUsuario();
            mostrarPanelUsuario();
        } else {
            // Verificar si estamos regresando de una redirección de Auth0
            const query = window.location.search;
            console.log('🔄 Query string:', query);
            
            if (query.includes('code=') && query.includes('state=')) {
                try {
                    console.log('🔄 Procesando redirección de Auth0...');
                    await auth0Client.handleRedirectCallback();
                    usuario = await auth0Client.getUser();
                    console.log('✅ Login exitoso:', usuario);
                    await cargarEstadisticasUsuario();
                    mostrarPanelUsuario();
                    // Limpiar la URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error('❌ Error al manejar la redirección:', error);
                    
                    // Verificar si es problema de callback URL
                    if (error.message.includes('callback') || error.message.includes('redirect_uri')) {
                        console.log('🚨 Problema de callback URL. Verifica:');
                        console.log(`📋 1. Agrega ${window.location.origin} a Auth0 Dashboard`);
                        console.log('🔧 2. Ve a Applications → Tu App → Allowed Callback URLs');
                        mostrarMensaje(`Configura ${window.location.origin} en Auth0 Dashboard`);
                    }
                    
                    mostrarPanelLogin();
                }
            } else {
                console.log('📋 Mostrando panel de login');
                mostrarPanelLogin();
            }
        }
    } catch (error) {
        console.error('❌ Error al inicializar Auth0:', error);
        console.error('🔍 Detalles del error:', error.message);
        
        // Verificar si es problema de origen seguro
        if (error.message.includes('secure origin') || error.message.includes('https')) {
            console.log('🚨 Auth0 requiere HTTPS. Opciones disponibles:');
            console.log('📋 1. Usar modo invitado (funciona completamente)');
            console.log('🔒 2. Configurar HTTPS para desarrollo');
            console.log('🌐 3. Usar la versión online cuando esté desplegada');
            mostrarMensaje('Auth0 requiere HTTPS. Usa modo invitado o despliega en línea.');
        } else {
            mostrarMensaje('Error de autenticación. Jugando como invitado.');
        }
        
        iniciarModoInvitado();
    }
}

// Función de login con Auth0
async function login() {
    try {
        console.log('🚀 Iniciando login con Google...');
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
                prompt: 'select_account'
            }
        });
    } catch (error) {
        console.error('❌ Error en el login:', error);
        mostrarMensaje('Error al iniciar sesión. Intenta de nuevo.');
    }
}

// Función de logout
async function logout() {
    try {
        console.log('👋 Cerrando sesión...');
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    } catch (error) {
        console.error('❌ Error en el logout:', error);
    }
}

// Mostrar panel de login
function mostrarPanelLogin() {
    document.getElementById('auth-panel').classList.remove('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('user-container').classList.add('hidden');
    document.getElementById('game-container').style.display = 'none';
}

// Iniciar modo invitado
function iniciarModoInvitado() {
    console.log('🎮 Iniciando modo invitado...');
    modoInvitado = true;
    usuario = null;
    usuarioStats = {
        maxStreak: parseInt(localStorage.getItem('wordle-guest-max-streak') || '0'),
        gamesPlayed: parseInt(localStorage.getItem('wordle-guest-games-played') || '0'),
        currentStreak: 0
    };
    racha = parseInt(localStorage.getItem('wordle-guest-current-streak') || '0');
    
    console.log('📊 Estadísticas de invitado cargadas:', usuarioStats);
    console.log('🔥 Racha actual:', racha);
    
    mostrarPanelUsuario(true);
    
    // Simular scoreboard local para invitados
    if (!window.localStorage.getItem('wordle-guest-scoreboard-init')) {
        console.log('🆕 Inicializando scoreboard local para invitados...');
        const guestScoreboard = [
            { name: 'Usuario Invitado', maxStreak: usuarioStats.maxStreak, gamesPlayed: usuarioStats.gamesPlayed, country: { flag: '🎮', name: 'Modo Local' } }
        ];
        localStorage.setItem('wordle-guest-scoreboard', JSON.stringify(guestScoreboard));
        localStorage.setItem('wordle-guest-scoreboard-init', 'true');
    }
}

// Mostrar panel de usuario
function mostrarPanelUsuario(esInvitado = false) {
    document.getElementById('auth-panel').classList.add('hidden');
    document.getElementById('game-container').style.display = 'block';
    
    if (!esInvitado && usuario) {
        // Usuario autenticado
        document.getElementById('user-avatar').src = usuario.picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEREQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzk5OSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjcuNTggMjUuNTIgMjQgMjAgMjRTMTAgMjcuNTggMTAgMzIiIGZpbGw9IiM5OTkiLz4KPC9zdmc+';
        document.getElementById('user-name').textContent = usuario.name || 'Usuario';
        document.getElementById('user-email').textContent = usuario.email || '';
    }
    
    // Actualizar estadísticas
    document.getElementById('max-streak').textContent = usuarioStats.maxStreak;
    document.getElementById('games-played').textContent = usuarioStats.gamesPlayed;
    
    actualizarRacha();
}

// ========== FUNCIONES DE ESTADÍSTICAS Y SCOREBOARD ==========

// Cargar estadísticas del usuario desde el servidor
async function cargarEstadisticasUsuario() {
    if (!usuario) return;
    
    try {
        // Simular carga desde servidor (reemplazar con tu API)
        const statsKey = `wordle-stats-${usuario.sub}`;
        const savedStats = localStorage.getItem(statsKey);
        
        if (savedStats) {
            usuarioStats = JSON.parse(savedStats);
        }
        
        // Cargar racha actual
        const currentStreakKey = `wordle-current-streak-${usuario.sub}`;
        racha = parseInt(localStorage.getItem(currentStreakKey) || '0');
        usuarioStats.currentStreak = racha;
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Guardar estadísticas del usuario
async function guardarEstadisticasUsuario() {
    try {
        if (modoInvitado) {
            // Guardar en localStorage para invitados
            localStorage.setItem('wordle-guest-max-streak', usuarioStats.maxStreak.toString());
            localStorage.setItem('wordle-guest-games-played', usuarioStats.gamesPlayed.toString());
            localStorage.setItem('wordle-guest-current-streak', racha.toString());
        } else if (usuario) {
            // Guardar para usuarios autenticados
            const statsKey = `wordle-stats-${usuario.sub}`;
            localStorage.setItem(statsKey, JSON.stringify(usuarioStats));
            
            const currentStreakKey = `wordle-current-streak-${usuario.sub}`;
            localStorage.setItem(currentStreakKey, racha.toString());
            
            // También enviar al scoreboard global
            await actualizarScoreboardGlobal();
        }
    } catch (error) {
        console.error('Error al guardar estadísticas:', error);
    }
}

// Actualizar scoreboard global usando base de datos
async function actualizarScoreboardGlobal() {
    if (!usuario || modoInvitado) return;
    
    try {
        console.log('🌍 Actualizando scoreboard global...');
        await baseDatosGlobal.actualizarUsuario(usuario, usuarioStats);
        console.log('✅ Scoreboard global actualizado');
    } catch (error) {
        console.error('❌ Error al actualizar scoreboard global:', error);
    }
}

// Cargar scoreboard global desde base de datos
async function cargarScoreboardGlobal() {
    try {
        // Si estamos en modo invitado, usar scoreboard local
        if (modoInvitado) {
            console.log('📋 Cargando scoreboard local (modo invitado)');
            const localScoreboard = localStorage.getItem('wordle-guest-scoreboard');
            if (localScoreboard) {
                const scoreboard = JSON.parse(localScoreboard);
                // Actualizar con stats actuales
                scoreboard[0] = {
                    name: 'Usuario Invitado',
                    maxStreak: usuarioStats.maxStreak,
                    gamesPlayed: usuarioStats.gamesPlayed,
                    country: { flag: '🎮', name: 'Modo Local' },
                    joinDate: new Date().toISOString()
                };
                localStorage.setItem('wordle-guest-scoreboard', JSON.stringify(scoreboard));
                return scoreboard;
            }
            return [{
                name: 'Usuario Invitado',
                maxStreak: usuarioStats.maxStreak,
                gamesPlayed: usuarioStats.gamesPlayed,
                country: { flag: '🎮', name: 'Modo Local' },
                joinDate: new Date().toISOString()
            }];
        }
        
        return await baseDatosGlobal.obtenerScoreboard();
    } catch (error) {
        console.error('❌ Error al cargar scoreboard global:', error);
        return [];
    }
}

// Mostrar scoreboard
async function mostrarScoreboard() {
    const modal = document.getElementById('scoreboard-modal');
    const loading = document.getElementById('scoreboard-loading');
    const scoreboardList = document.getElementById('scoreboard-list');
    
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    scoreboardList.classList.add('hidden');
    
    try {
        const scoreboard = await cargarScoreboardGlobal();
        
        if (scoreboard.length === 0) {
            scoreboardList.innerHTML = '<div class="loading">No hay datos de ranking disponibles</div>';
        } else {
            scoreboardList.innerHTML = '';
            
            scoreboard.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'scoreboard-item';
                
                // Marcar al usuario actual
                if (usuario && entry.userId === usuario.sub) {
                    item.classList.add('current-user');
                }
                
                const rank = index + 1;
                let rankClass = '';
                let rankIcon = '';
                
                if (rank === 1) {
                    rankClass = 'gold';
                    rankIcon = '🥇';
                } else if (rank === 2) {
                    rankClass = 'silver';
                    rankIcon = '🥈';
                } else if (rank === 3) {
                    rankClass = 'bronze';
                    rankIcon = '🥉';
                }
                
                const country = entry.country || { flag: '🌍', name: 'Desconocido' };
                const joinDate = entry.joinDate ? new Date(entry.joinDate).toLocaleDateString() : 'Reciente';
                
                // SOLUCIÓN XSS: Crear elementos seguros sin innerHTML
                const rankDiv = document.createElement('div');
                rankDiv.className = `scoreboard-rank ${rankClass}`;
                rankDiv.textContent = rankIcon || rank;
                
                const avatar = document.createElement('img');
                avatar.className = 'scoreboard-avatar';
                avatar.src = entry.picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEREQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzk5OSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjcuNTggMjUuNTIgMjQgMjAgMjRTMTAgMjcuNTggMTAgMzIiIGZpbGw9IiM5OTkiLz4KPC9zdmc+';
                avatar.alt = entry.name; // textContent automáticamente sanitizado
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'scoreboard-info';
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'scoreboard-name';
                nameDiv.textContent = `${entry.name} ${country.flag}`; // ✅ XSS SAFE
                
                const gamesDiv = document.createElement('div');
                gamesDiv.className = 'scoreboard-games';
                gamesDiv.textContent = `${entry.gamesPlayed} partidas • Se unió: ${joinDate}`; // ✅ XSS SAFE
                
                const countryDiv = document.createElement('div');
                countryDiv.className = 'scoreboard-country';
                countryDiv.textContent = country.name; // ✅ XSS SAFE
                
                const streakDiv = document.createElement('div');
                streakDiv.className = 'scoreboard-streak';
                streakDiv.textContent = `${entry.maxStreak} 🔥`; // ✅ XSS SAFE
                
                // Ensamblar estructura segura
                infoDiv.appendChild(nameDiv);
                infoDiv.appendChild(gamesDiv);
                infoDiv.appendChild(countryDiv);
                
                item.appendChild(rankDiv);
                item.appendChild(avatar);
                item.appendChild(infoDiv);
                item.appendChild(streakDiv);
                
                scoreboardList.appendChild(item);
            });
        }
        
        loading.classList.add('hidden');
        scoreboardList.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error al mostrar scoreboard:', error);
        scoreboardList.innerHTML = '<div class="loading">Error al cargar el ranking</div>';
        loading.classList.add('hidden');
        scoreboardList.classList.remove('hidden');
    }
}

// Cerrar scoreboard
function cerrarScoreboard() {
    document.getElementById('scoreboard-modal').classList.add('hidden');
}

// ========== FUNCIONES MODIFICADAS DEL JUEGO ==========

// Actualizar función de racha para guardar estadísticas
function actualizarRachaConStats() {
    const rachaElement = document.getElementById('racha');
    rachaElement.innerHTML = `Racha: ${racha}<span class="fire-emoji">🔥</span>`;
    
    // Actualizar estadísticas
    usuarioStats.currentStreak = racha;
    if (racha > usuarioStats.maxStreak) {
        usuarioStats.maxStreak = racha;
    }
    
    // Actualizar UI
    document.getElementById('max-streak').textContent = usuarioStats.maxStreak;
    document.getElementById('games-played').textContent = usuarioStats.gamesPlayed;
    
    guardarEstadisticasUsuario();
}

// Función modificada para manejar el final del juego
function manejarFinJuego(ganado) {
    usuarioStats.gamesPlayed++;
    
    if (ganado) {
        racha++;
    } else {
        racha = 0;
    }
    
    actualizarRachaConStats();
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', async () => {
    // Activar sistema anti-trampa
    antiTrampa();
    
    cargarTema();
    
    // Esperar a que se cargue completamente la página
    await new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
    
    console.log('🚀 Página cargada completamente, inicializando Auth0...');
    
    // Inicializar Auth0 después de que todo esté cargado
    await inicializarAuth0();
    
    inicializarPalabraObjetivo();
    crearTablero();
    crearTecladoVirtual();
    actualizarRacha();
    
    // Event listeners para autenticación
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('guest-btn').addEventListener('click', iniciarModoInvitado);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Event listeners para scoreboard
    document.getElementById('scoreboard-btn').addEventListener('click', mostrarScoreboard);
    document.getElementById('close-scoreboard').addEventListener('click', cerrarScoreboard);
    
    // Cerrar modal con click fuera del contenido
    document.getElementById('scoreboard-modal').addEventListener('click', (e) => {
        if (e.target.id === 'scoreboard-modal') {
            cerrarScoreboard();
        }
    });
    
    // Agregar event listener para el botón de tema
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', alternarTema);
    
    document.addEventListener('keydown', (e) => {
        manejarTecla(e.key);
    });
});