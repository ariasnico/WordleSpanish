// Configuración de Firebase para base de datos global
const FIREBASE_CONFIG = {
    // ✅ SEGURIDAD: Solo placeholders públicos para demo
    // En producción: usar variables de entorno
    apiKey: "demo-key-not-real", // ← No exponer claves reales
    authDomain: "wordle-spanish-demo.firebaseapp.com",
    databaseURL: "https://wordle-spanish-demo.firebaseio.com",
    projectId: "wordle-spanish-demo",
    storageBucket: "wordle-spanish-demo.appspot.com",
    messagingSenderId: "000000000",
    appId: "demo-app-id-not-real"
    
    // NOTA: En producción real usar:
    // apiKey: process.env.VITE_FIREBASE_API_KEY || "demo-key"
};

// Sistema de base de datos global simulado
class BasesDatosGlobal {
    constructor() {
        this.apiUrl = 'https://api.jsonbin.io/v3/b'; // API gratuita para datos JSON
        // ✅ SEGURIDAD: No exponer API keys reales en frontend
        this.apiKey = 'demo-key-not-real'; // En producción: usar backend
        this.binId = 'wordle-spanish-demo'; // ID único para demo
        
        // NOTA: Para producción real:
        // - Mover API calls a backend/serverless function
        // - Nunca exponer API keys en frontend
        // - Usar autenticación server-to-server
    }

    // Obtener scoreboard global
    async obtenerScoreboard() {
        try {
            console.log('🌍 Cargando scoreboard global...');
            
            // Por ahora usar localStorage como respaldo, pero estructura para API real
            const scoreboardLocal = localStorage.getItem('wordle-global-scoreboard');
            if (scoreboardLocal) {
                return JSON.parse(scoreboardLocal);
            }
            
            // En producción, hacer fetch a la API:
            /*
            const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Meta': 'false'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.scoreboard || [];
            }
            */
            
            return [];
        } catch (error) {
            console.error('❌ Error al cargar scoreboard global:', error);
            return JSON.parse(localStorage.getItem('wordle-global-scoreboard') || '[]');
        }
    }

    // Guardar scoreboard global
    async guardarScoreboard(scoreboard) {
        try {
            console.log('🌍 Guardando scoreboard global...');
            
            // Guardar localmente como respaldo
            localStorage.setItem('wordle-global-scoreboard', JSON.stringify(scoreboard));
            
            // En producción, enviar a la API:
            /*
            const response = await fetch(`${this.apiUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify({
                    scoreboard: scoreboard,
                    lastUpdated: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al guardar en servidor');
            }
            */
            
            console.log('✅ Scoreboard guardado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar scoreboard:', error);
            // Al menos guardar localmente
            localStorage.setItem('wordle-global-scoreboard', JSON.stringify(scoreboard));
            return false;
        }
    }

    // Actualizar estadísticas de usuario
    async actualizarUsuario(usuario, stats) {
        try {
            const scoreboard = await this.obtenerScoreboard();
            
            // Buscar si el usuario ya existe
            const userIndex = scoreboard.findIndex(entry => entry.userId === usuario.sub);
            
            const userEntry = {
                userId: usuario.sub,
                name: usuario.name,
                email: usuario.email,
                picture: usuario.picture,
                maxStreak: stats.maxStreak,
                gamesPlayed: stats.gamesPlayed,
                lastUpdated: Date.now(),
                country: await this.detectarPais(), // Detectar país del usuario
                joinDate: userIndex >= 0 ? scoreboard[userIndex].joinDate : Date.now()
            };
            
            if (userIndex >= 0) {
                scoreboard[userIndex] = userEntry;
                console.log('👤 Usuario actualizado en scoreboard global');
            } else {
                scoreboard.push(userEntry);
                console.log('🆕 Nuevo usuario agregado al scoreboard global');
            }
            
            // Ordenar por racha máxima
            scoreboard.sort((a, b) => b.maxStreak - a.maxStreak);
            
            // Mantener solo los top 1000 para optimizar
            const topScoreboard = scoreboard.slice(0, 1000);
            
            await this.guardarScoreboard(topScoreboard);
            return topScoreboard;
            
        } catch (error) {
            console.error('❌ Error al actualizar usuario en scoreboard:', error);
            return [];
        }
    }

    // Detectar país del usuario (aproximado)
    async detectarPais() {
        try {
            // ✅ SEGURIDAD: Validación completa de API externa
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            
            const response = await fetch('https://ipapi.co/json/', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'WordleSpanish/1.0'
                }
            });
            
            clearTimeout(timeoutId);
            
            // ✅ Validar respuesta
            if (!response.ok || response.status !== 200) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API response not JSON');
            }
            
            const data = await response.json();
            
            // ✅ Validar estructura de datos
            if (!data || typeof data.country_code !== 'string' || typeof data.country_name !== 'string') {
                throw new Error('Invalid API response structure');
            }
            
            // ✅ Sanitizar datos de respuesta
            const countryCode = data.country_code.substring(0, 2).toUpperCase();
            const countryName = data.country_name.substring(0, 50); // Limitar longitud
            
            return {
                code: countryCode,
                name: countryName,
                flag: this.obtenerBandera(countryCode)
            };
            
        } catch (error) {
            console.log('No se pudo detectar el país:', error.message);
            // ✅ Fallback seguro
        }
        
        return {
            code: 'UN',
            name: 'Desconocido',
            flag: '🌍'
        };
    }

    // Obtener emoji de bandera por código de país
    obtenerBandera(countryCode) {
        if (!countryCode || countryCode === 'UN') return '🌍';
        
        const flagEmojis = {
            'AR': '🇦🇷', 'ES': '🇪🇸', 'MX': '🇲🇽', 'CO': '🇨🇴', 'PE': '🇵🇪',
            'CL': '🇨🇱', 'VE': '🇻🇪', 'EC': '🇪🇨', 'UY': '🇺🇾', 'PY': '🇵🇾',
            'BO': '🇧🇴', 'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳',
            'SV': '🇸🇻', 'NI': '🇳🇮', 'CU': '🇨🇺', 'DO': '🇩🇴', 'PR': '🇵🇷',
            'US': '🇺🇸', 'CA': '🇨🇦', 'BR': '🇧🇷', 'FR': '🇫🇷', 'IT': '🇮🇹',
            'DE': '🇩🇪', 'GB': '🇬🇧', 'PT': '🇵🇹'
        };
        
        return flagEmojis[countryCode] || '🌍';
    }
}

// Crear instancia global
window.baseDatosGlobal = new BasesDatosGlobal(); 