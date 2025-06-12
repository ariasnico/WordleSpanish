// Función serverless para manejar el scoreboard de forma segura
export default async function handler(req, res) {
    // BASE DE DATOS PERMANENTE: Usar Firebase Realtime Database
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyB5K8l2Q9Y3XmZ4P7vF6wA8rN1sT9uE0iO",
        authDomain: "wordle-spanish-global.firebaseapp.com",
        databaseURL: "https://wordle-spanish-global-default-rtdb.firebaseio.com/",
        projectId: "wordle-spanish-global"
    };
    
    // Usar Firebase REST API (sin SDK para serverless)
    const DB_URL = `${FIREBASE_CONFIG.databaseURL}scoreboard.json`;

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
            // Obtener de Firebase
            const response = await fetch(DB_URL);
            
            if (!response.ok) {
                return res.status(200).json([]);
            }

            const data = await response.json();
            const scoreboard = data || [];
            
            res.status(200).json(Array.isArray(scoreboard) ? scoreboard : []);

        } else if (req.method === 'PUT') {
            // Actualizar scoreboard
            const { scoreboard } = req.body;

            // Validar datos
            if (!Array.isArray(scoreboard)) {
                return res.status(400).json({ error: 'Invalid scoreboard data' });
            }

            // Limitar tamaño
            const limitedScoreboard = scoreboard.slice(0, 500);
            
            // Guardar en Firebase
            const response = await fetch(DB_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(limitedScoreboard)
            });
            
            if (!response.ok) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({ success: true });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        // Log mínimo para producción
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
} 