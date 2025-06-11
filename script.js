// Configuración de Auth0
const AUTH0_CONFIG = {
    domain: 'dev-odty0l3abcja7dfs.us.auth0.com', // Ejemplo: dev-xxxxxxxx.us.auth0.com
    clientId: 'Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc', // Ejemplo: abcd1234efgh5678...
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email'
};

// Variables globales de autenticación
let auth0Client = null;
let usuario = null;
let usuarioStats = {
    maxStreak: 0,
    gamesPlayed: 0,
    currentStreak: 0
};
let modoInvitado = false;

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

// Variables globales del juego
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

// Inicializar Auth0
async function inicializarAuth0() {
    try {
        auth0Client = await createAuth0Client(AUTH0_CONFIG);
        console.log('Auth0 inicializado correctamente');
        
        // Verificar si ya hay una sesión activa
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
            usuario = await auth0Client.getUser();
            await cargarEstadisticasUsuario();
            mostrarPanelUsuario();
        } else {
            // Verificar si estamos regresando de una redirección de Auth0
            const query = window.location.search;
            if (query.includes('code=') && query.includes('state=')) {
                try {
                    await auth0Client.handleRedirectCallback();
                    usuario = await auth0Client.getUser();
                    await cargarEstadisticasUsuario();
                    mostrarPanelUsuario();
                    // Limpiar la URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error('Error al manejar la redirección:', error);
                    mostrarPanelLogin();
                }
            } else {
                mostrarPanelLogin();
            }
        }
    } catch (error) {
        console.error('Error al inicializar Auth0:', error);
        mostrarMensaje('Error de autenticación. Jugando como invitado.');
        iniciarModoInvitado();
    }
}

// Función de login
async function login() {
    try {
        await auth0Client.loginWithRedirect({
            connection: 'google-oauth2',
            prompt: 'select_account'
        });
    } catch (error) {
        console.error('Error en el login:', error);
        mostrarMensaje('Error al iniciar sesión. Intenta de nuevo.');
    }
}

// Función de logout
async function logout() {
    try {
        await auth0Client.logout({
            returnTo: window.location.origin
        });
    } catch (error) {
        console.error('Error en el logout:', error);
    }
}

// Iniciar modo invitado
function iniciarModoInvitado() {
    modoInvitado = true;
    usuario = null;
    usuarioStats = {
        maxStreak: parseInt(localStorage.getItem('wordle-guest-max-streak') || '0'),
        gamesPlayed: parseInt(localStorage.getItem('wordle-guest-games-played') || '0'),
        currentStreak: 0
    };
    racha = parseInt(localStorage.getItem('wordle-guest-current-streak') || '0');
    mostrarPanelUsuario(true);
}

// Mostrar panel de login
function mostrarPanelLogin() {
    document.getElementById('auth-panel').classList.remove('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('user-container').classList.add('hidden');
    document.getElementById('game-container').style.display = 'none';
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

// Actualizar scoreboard global
async function actualizarScoreboardGlobal() {
    if (!usuario || modoInvitado) return;
    
    try {
        // Simular envío a servidor (reemplazar con tu API)
        const scoreboardKey = 'wordle-global-scoreboard';
        let scoreboard = JSON.parse(localStorage.getItem(scoreboardKey) || '[]');
        
        // Buscar si el usuario ya existe en el scoreboard
        const userIndex = scoreboard.findIndex(entry => entry.userId === usuario.sub);
        
        const userEntry = {
            userId: usuario.sub,
            name: usuario.name,
            email: usuario.email,
            picture: usuario.picture,
            maxStreak: usuarioStats.maxStreak,
            gamesPlayed: usuarioStats.gamesPlayed,
            lastUpdated: Date.now()
        };
        
        if (userIndex >= 0) {
            scoreboard[userIndex] = userEntry;
        } else {
            scoreboard.push(userEntry);
        }
        
        // Ordenar por racha máxima
        scoreboard.sort((a, b) => b.maxStreak - a.maxStreak);
        
        // Mantener solo los top 100
        scoreboard = scoreboard.slice(0, 100);
        
        localStorage.setItem(scoreboardKey, JSON.stringify(scoreboard));
        
    } catch (error) {
        console.error('Error al actualizar scoreboard global:', error);
    }
}

// Cargar scoreboard global
async function cargarScoreboardGlobal() {
    try {
        // Simular carga desde servidor (reemplazar con tu API)
        const scoreboardKey = 'wordle-global-scoreboard';
        const scoreboard = JSON.parse(localStorage.getItem(scoreboardKey) || '[]');
        
        return scoreboard.sort((a, b) => b.maxStreak - a.maxStreak);
        
    } catch (error) {
        console.error('Error al cargar scoreboard:', error);
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
                
                item.innerHTML = `
                    <div class="scoreboard-rank ${rankClass}">${rankIcon || rank}</div>
                    <img class="scoreboard-avatar" src="${entry.picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEREQiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzk5OSIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjcuNTggMjUuNTIgMjQgMjAgMjRTMTAgMjcuNTggMTAgMzIiIGZpbGw9IiM5OTkiLz4KPC9zdmc+'}" alt="${entry.name}">
                    <div class="scoreboard-info">
                        <div class="scoreboard-name">${entry.name}</div>
                        <div class="scoreboard-games">${entry.gamesPlayed} partidas</div>
                    </div>
                    <div class="scoreboard-streak">${entry.maxStreak} 🔥</div>
                `;
                
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
    cargarTema();
    
    // Inicializar Auth0 primero
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