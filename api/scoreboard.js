// Función serverless para manejar el scoreboard de forma segura
export default async function handler(req, res) {
    console.log('🔍 API Call:', req.method, req.url);
    
    // Configuración segura en variables de entorno
    const API_KEY = process.env.JSONBIN_API_KEY || '$2a$10$RBFwojY4p9D..VhMXEO.LO1rGjWjWbmjWp7jhX1F4l5rJnWmSuQJC';
    const BIN_ID = process.env.JSONBIN_BIN_ID; // Sin fallback, forzar creación
    const API_URL = 'https://api.jsonbin.io/v3/b';
    
    // Si no hay BIN_ID, crear uno nuevo automáticamente
    if (!BIN_ID) {
        console.log('🆕 No hay BIN_ID, creando nuevo bin...');
        try {
            const createResponse = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY,
                    'X-Bin-Name': 'Wordle-Spanish-Scoreboard'
                },
                body: JSON.stringify({
                    scoreboard: [],
                    created: Date.now(),
                    version: '1.0'
                })
            });
            
            if (createResponse.ok) {
                const createData = await createResponse.json();
                const newBinId = createData.metadata.id;
                console.log('✅ Bin creado exitosamente:', newBinId);
                
                // Usar el nuevo BIN_ID para esta sesión
                process.env.JSONBIN_BIN_ID = newBinId;
                console.log('🔧 BIN_ID establecido para esta sesión');
            } else {
                throw new Error('No se pudo crear el bin');
            }
        } catch (createError) {
            console.error('❌ Error creando bin:', createError);
            // Usar un bin hardcodeado como último recurso
            process.env.JSONBIN_BIN_ID = '676554b1e41b4d34e45ba569';
        }
    }
    
    // Usar el BIN_ID actual (puede haber sido creado arriba)
    const finalBinId = process.env.JSONBIN_BIN_ID;
    console.log('🔧 Config:', { BIN_ID: finalBinId, API_URL });

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
            
            // Obtener scoreboard
            const url = `${API_URL}/${finalBinId}/latest`;
            console.log('🌐 Fetching:', url);
            
            const response = await fetch(url, {
                headers: {
                    'X-Master-Key': API_KEY,
                    'X-Bin-Meta': 'false'
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ JSONBin Error:', errorText);
                throw new Error(`JSONBin API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Data received:', data);
            
            const scoreboard = data.scoreboard || [];
            console.log('📊 Returning scoreboard with', scoreboard.length, 'users');
            
            res.status(200).json(scoreboard);

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

            // Limitar tamaño
            const limitedScoreboard = scoreboard.slice(0, 500);
            console.log('✂️ Limited to', limitedScoreboard.length, 'users');

            const payload = {
                scoreboard: limitedScoreboard,
                lastUpdated: Date.now(),
                version: '1.0',
                totalUsers: limitedScoreboard.length
            };
            
            console.log('📦 Payload:', payload);

            const url = `${API_URL}/${finalBinId}`;
            console.log('🌐 PUT to:', url);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 PUT Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ JSONBin PUT Error:', errorText);
                throw new Error(`JSONBin PUT API Error: ${response.status} - ${errorText}`);
            }

            console.log('✅ PUT successful');
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