// Función serverless para manejar el scoreboard de forma segura
export default async function handler(req, res) {
    console.log('🔍 API Call:', req.method, req.url);
    
    // SOLUCIÓN TEMPORAL: Usar un servicio más simple hasta arreglar JSONBin
    console.log('🔄 Usando sistema de scoreboard simplificado temporalmente');
    
    // Simular una base de datos simple en memoria para esta sesión
    if (!global.scoreboardData) {
        global.scoreboardData = [];
    }
    
    console.log('🔧 Scoreboard actual tiene', global.scoreboardData.length, 'usuarios');

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
            console.log('📥 GET Request');
            
            // Devolver scoreboard actual
            console.log('📊 Returning scoreboard with', global.scoreboardData.length, 'users');
            res.status(200).json(global.scoreboardData);

        } else if (req.method === 'PUT') {
            console.log('📤 PUT Request');
            
            // Actualizar scoreboard
            const { scoreboard } = req.body;
            console.log('📊 Received scoreboard:', scoreboard);

            // Validar datos
            if (!Array.isArray(scoreboard)) {
                console.error('❌ Invalid data: not array');
                return res.status(400).json({ error: 'Invalid scoreboard data' });
            }

            // Actualizar datos globales
            global.scoreboardData = scoreboard.slice(0, 500);
            console.log('✅ Scoreboard actualizado con', global.scoreboardData.length, 'usuarios');

            res.status(200).json({ success: true });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('❌ Scoreboard API Error:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
        
        // Enviar más detalles del error para debug
        res.status(500).json({ 
            error: 'Internal server error',
            debug: error.message,
            timestamp: new Date().toISOString()
        });
    }
} 