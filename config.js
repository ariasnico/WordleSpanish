// Configuración de la aplicación
const CONFIG = {
    // Configuración de Auth0
    AUTH0: {
        domain: window.location.hostname === 'localhost' 
            ? 'dev-odty0l3abcja7dfs.us.auth0.com'  // Desarrollo
            : 'dev-odty0l3abcja7dfs.us.auth0.com', // Producción (mismo por ahora)
        clientId: window.location.hostname === 'localhost'
            ? 'Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc'  // Desarrollo  
            : 'Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc', // Producción (mismo por ahora)
        redirectUri: window.location.origin,
        responseType: 'code',
        scope: 'openid profile email'
    },
    
    // URLs de la aplicación
    URLS: {
        development: 'http://localhost:8080',
        production: 'https://ariasnico.github.io/WordleSpanish'
    },
    
    // Configuración del juego
    GAME: {
        maxAttempts: 6,
        wordLength: 5,
        scoreboardLimit: 100
    }
};

// Detectar entorno
CONFIG.environment = window.location.hostname === 'localhost' ? 'development' : 'production';
CONFIG.isProduction = CONFIG.environment === 'production';

// Exportar configuración
window.CONFIG = CONFIG; 