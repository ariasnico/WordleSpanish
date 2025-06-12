// Configuración de la aplicación
const CONFIG = {
    // Configuración de Auth0
    AUTH0: {
        domain: 'dev-odty0l3abcja7dfs.us.auth0.com',
        clientId: 'Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc',
        authorizationParams: {
            redirect_uri: window.location.origin,
            audience: undefined,
            scope: 'openid profile email'
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: window.location.protocol === 'https:' // Solo con HTTPS
    },
    
    // URLs de la aplicación
    URLS: {
        development: 'http://localhost:8080',
        production: 'https://wordle-spanish-xgdn-six.vercel.app'
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