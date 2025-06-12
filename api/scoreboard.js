// Función serverless para manejar el scoreboard de forma segura
export default async function handler(req, res) {
    // Configuración segura en variables de entorno
    const API_KEY = process.env.JSONBIN_API_KEY || '$2a$10$RBFwojY4p9D..VhMXEO.LO1rGjWjWbmjWp7jhX1F4l5rJnWmSuQJC';
    const BIN_ID = process.env.JSONBIN_BIN_ID || '67653a2ce41b4d34e45ba45e';
    const API_URL = 'https://api.jsonbin.io/v3/b';

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
            // Obtener scoreboard
            const response = await fetch(`${API_URL}/${BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': API_KEY,
                    'X-Bin-Meta': 'false'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            res.status(200).json(data.scoreboard || []);

        } else if (req.method === 'PUT') {
            // Actualizar scoreboard
            const { scoreboard } = req.body;

            // Validar datos
            if (!Array.isArray(scoreboard)) {
                return res.status(400).json({ error: 'Invalid scoreboard data' });
            }

            // Limitar tamaño
            const limitedScoreboard = scoreboard.slice(0, 500);

            const payload = {
                scoreboard: limitedScoreboard,
                lastUpdated: Date.now(),
                version: '1.0',
                totalUsers: limitedScoreboard.length
            };

            const response = await fetch(`${API_URL}/${BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            res.status(200).json({ success: true });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('Scoreboard API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 