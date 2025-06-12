// ✅ FIREBASE SEGURO: Credenciales desde variables de entorno (nunca expuestas)
const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY || "demo-fallback-key",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "wordle-spanish-demo.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://wordle-spanish-demo-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "wordle-spanish-demo"
};

// Fallback data para cuando Firebase no esté disponible
let FALLBACK_SCOREBOARD = [
    {
        userId: 'demo-user-1',
        name: 'Jugador Demo',
        maxStreak: 5,
        gamesPlayed: 10,
        country: { flag: '🇪🇸', name: 'España' },
        joinDate: new Date().toISOString(),
        picture: 'https://ui-avatars.com/api/?name=Demo&background=4caf50&color=fff'
    }
];

// Función serverless para manejar el scoreboard de forma segura
export default async function handler(req, res) {
    const DB_URL = `${FIREBASE_CONFIG.databaseURL}/scoreboard.json?auth=${FIREBASE_CONFIG.apiKey}`;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Intentar obtener de Firebase primero
            try {
                const response = await fetch(DB_URL);
                
                if (response.ok) {
                    const data = await response.json();
                    const scoreboard = data || FALLBACK_SCOREBOARD;
                    return res.status(200).json(Array.isArray(scoreboard) ? scoreboard : FALLBACK_SCOREBOARD);
                } else {
                    throw new Error(`Firebase response: ${response.status}`);
                }
            } catch (firebaseError) {
                // Si Firebase falla, usar fallback
                console.log('📦 Firebase no disponible, usando fallback');
                return res.status(200).json(FALLBACK_SCOREBOARD);
            }

        } else if (req.method === 'PUT') {
            // Actualizar scoreboard
            const { scoreboard } = req.body;

            // Validar datos
            if (!Array.isArray(scoreboard)) {
                return res.status(400).json({ error: 'Invalid scoreboard data' });
            }

            // Limitar tamaño
            const limitedScoreboard = scoreboard.slice(0, 500);
            
            // Intentar guardar en Firebase
            try {
                const response = await fetch(DB_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(limitedScoreboard)
                });
                
                if (response.ok) {
                    return res.status(200).json({ success: true, source: 'firebase' });
                } else {
                    throw new Error(`Firebase save failed: ${response.status}`);
                }
            } catch (firebaseError) {
                // Si Firebase falla, actualizar fallback
                console.log('📦 Firebase no disponible para escritura, usando fallback');
                FALLBACK_SCOREBOARD = limitedScoreboard;
                return res.status(200).json({ success: true, source: 'fallback' });
            }

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        // Log mínimo para producción
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
} 