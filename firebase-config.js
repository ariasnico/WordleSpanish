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

// Sistema de base de datos global SEGURO usando proxy serverless
class BasesDatosGlobal {
    constructor() {
        // ✅ SEGURO: API key oculta en el backend
        this.apiUrl = `${window.location.origin}/api/scoreboard`;
        
        // Cache local como respaldo
        this.cacheKey = 'wordle-global-scoreboard-cache';
        this.lastSyncKey = 'wordle-last-sync';
    }

    // Obtener scoreboard global desde la API segura
    async obtenerScoreboard() {
        try {
            console.log('🌍 Cargando scoreboard desde API segura...');
            
            // Llamar a nuestra API serverless (sin exponer credenciales)
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const scoreboard = await response.json();
                
                // Guardar en cache local
                localStorage.setItem(this.cacheKey, JSON.stringify(scoreboard));
                localStorage.setItem(this.lastSyncKey, Date.now().toString());
                
                console.log(`✅ Scoreboard cargado: ${scoreboard.length} usuarios`);
                return scoreboard;
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
            
        } catch (error) {
            console.log('⚠️ Usando cache local como respaldo:', error.message);
            
            // Usar cache local como respaldo
            const cachedScoreboard = localStorage.getItem(this.cacheKey);
            if (cachedScoreboard) {
                return JSON.parse(cachedScoreboard);
            }
            
            return [];
        }
    }

    // Guardar scoreboard global usando API segura
    async guardarScoreboard(scoreboard) {
        try {
            console.log('🌍 Guardando scoreboard usando API segura...');
            
            const response = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ scoreboard })
            });
            
            if (response.ok) {
                // También guardar en cache local
                localStorage.setItem(this.cacheKey, JSON.stringify(scoreboard));
                localStorage.setItem(this.lastSyncKey, Date.now().toString());
                
                console.log('✅ Scoreboard guardado exitosamente usando API segura');
                return true;
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error al guardar usando API segura:', error);
            
            // Al menos guardar en cache local
            localStorage.setItem(this.cacheKey, JSON.stringify(scoreboard));
            console.log('💾 Guardado en cache local como respaldo');
            return false;
        }
    }

    // Actualizar estadísticas de usuario en el scoreboard global
    async actualizarUsuario(usuario, stats) {
        try {
            console.log(`👤 Actualizando usuario: ${usuario.name}`);
            
            // Obtener scoreboard actual
            const scoreboard = await this.obtenerScoreboard();
            
            // Buscar si el usuario ya existe
            const userIndex = scoreboard.findIndex(entry => entry.userId === usuario.sub);
            
            // Crear entrada del usuario
            const userEntry = {
                userId: usuario.sub,
                name: usuario.name,
                email: usuario.email,
                picture: usuario.picture,
                maxStreak: stats.maxStreak,
                currentStreak: stats.currentStreak || 0,
                gamesPlayed: stats.gamesPlayed,
                lastUpdated: Date.now(),
                country: await this.detectarPais(),
                joinDate: userIndex >= 0 ? scoreboard[userIndex].joinDate : Date.now()
            };
            
            if (userIndex >= 0) {
                // Actualizar usuario existente
                scoreboard[userIndex] = userEntry;
                console.log('✅ Usuario actualizado en scoreboard global');
            } else {
                // Agregar nuevo usuario
                scoreboard.push(userEntry);
                console.log('🆕 Nuevo usuario agregado al scoreboard global');
            }
            
            // Ordenar por racha máxima (descendente)
            scoreboard.sort((a, b) => {
                if (b.maxStreak !== a.maxStreak) {
                    return b.maxStreak - a.maxStreak;
                }
                // Si tienen la misma racha máxima, ordenar por partidas jugadas
                return b.gamesPlayed - a.gamesPlayed;
            });
            
            // Mantener solo los top 500 para optimizar
            const topScoreboard = scoreboard.slice(0, 500);
            
            // Guardar en base de datos real
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
            
            if (!response.ok || response.status !== 200) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API response not JSON');
            }
            
            const data = await response.json();
            
            if (!data || typeof data.country_code !== 'string' || typeof data.country_name !== 'string') {
                throw new Error('Invalid API response structure');
            }
            
            const countryCode = data.country_code.substring(0, 2).toUpperCase();
            const countryName = data.country_name.substring(0, 50);
            
            return {
                code: countryCode,
                name: countryName,
                flag: this.obtenerBandera(countryCode)
            };
            
        } catch (error) {
            console.log('No se pudo detectar el país:', error.message);
        }
        
        return {
            code: 'UN',
            name: 'Desconocido',
            flag: '🌍'
        };
    }

    // Obtener emoji de bandera por código de país
    obtenerBandera(countryCode) {
        const flagMap = {
            'AR': '🇦🇷', 'ES': '🇪🇸', 'MX': '🇲🇽', 'CO': '🇨🇴', 'PE': '🇵🇪',
            'CL': '🇨🇱', 'VE': '🇻🇪', 'EC': '🇪🇨', 'BO': '🇧🇴', 'UY': '🇺🇾',
            'PY': '🇵🇾', 'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳',
            'SV': '🇸🇻', 'NI': '🇳🇮', 'CU': '🇨🇺', 'DO': '🇩🇴', 'PR': '🇵🇷',
            'US': '🇺🇸', 'CA': '🇨🇦', 'BR': '🇧🇷', 'FR': '🇫🇷', 'IT': '🇮🇹',
            'DE': '🇩🇪', 'GB': '🇬🇧', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳'
        };
        
        return flagMap[countryCode] || '🌍';
    }

    // Método para limpiar cache (útil para debugging)
    limpiarCache() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.lastSyncKey);
        console.log('🧹 Cache local limpiado');
    }

    // Obtener información del cache
    obtenerInfoCache() {
        const lastSync = localStorage.getItem(this.lastSyncKey);
        const cacheData = localStorage.getItem(this.cacheKey);
        
        return {
            lastSync: lastSync ? new Date(parseInt(lastSync)) : null,
            cacheSize: cacheData ? JSON.parse(cacheData).length : 0,
            hasCache: !!cacheData
        };
    }
}

// Instancia global
const baseDatosGlobal = new BasesDatosGlobal();

// Exportar para uso global
window.baseDatosGlobal = baseDatosGlobal;

// DEBUG: Función global para diagnosticar problemas del scoreboard
window.debugWordle = async function() {
    console.log('🔍 === DEBUG WORDLE SCOREBOARD ===');
    
    // Info básica
    console.log('🌍 URL actual:', window.location.href);
    console.log('📱 User Agent:', navigator.userAgent);
    
    // API Test
    try {
        console.log('🌐 Probando API /api/scoreboard GET...');
        const getResponse = await fetch('/api/scoreboard');
        console.log('📡 GET Status:', getResponse.status);
        
        if (getResponse.ok) {
            const data = await getResponse.json();
            console.log('📋 Datos del servidor:', data);
            console.log('👥 Total usuarios en el servidor:', data.length);
            
            // Mostrar cada usuario
            data.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.userId}) - Racha: ${user.maxStreak}`);
            });
        } else {
            console.error('❌ Error GET:', await getResponse.text());
        }
        
    } catch (error) {
        console.error('❌ Error en API test:', error);
    }
    
    // Cache local
    const cache = localStorage.getItem('wordle-global-scoreboard-cache');
    console.log('💾 Cache local:', cache ? JSON.parse(cache) : 'No cache');
    
    console.log('🔍 === FIN DEBUG ===');
    console.log('💡 Ejecuta debugWordle() en la consola para diagnosticar');
}; 