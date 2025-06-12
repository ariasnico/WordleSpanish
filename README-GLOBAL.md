# 🌍 Wordle Español - Sistema Global con Auth0

## ✨ **Sistema Completamente Global**

Tu Wordle ahora tiene **autenticación real con Google** y un **scoreboard verdaderamente global** donde cualquier persona del mundo puede competir.

### 🔥 **Características Globales:**

- **🌍 Competencia Mundial**: Cualquier persona desde cualquier país puede jugar y competir
- **🔐 Autenticación Real**: Login con Google a través de Auth0
- **🏆 Ranking Global**: Top 1000 jugadores de todo el mundo
- **🇪🇸 Banderas de Países**: Se muestra el país de cada jugador automáticamente
- **📊 Estadísticas Detalladas**: Racha máxima, partidas jugadas, fecha de unión
- **⚡ Tiempo Real**: Las actualizaciones se sincronizan globalmente

## 🚀 **Instalación y Configuración**

### 1. **Configurar Auth0** (Sistema de Login Global)

1. Ve a [auth0.com](https://auth0.com) y crea una cuenta
2. Crea una aplicación "Single Page Application"
3. En **Settings**, configura:
   ```
   Allowed Callback URLs: http://localhost:8080, https://tu-dominio.com
   Allowed Logout URLs: http://localhost:8080, https://tu-dominio.com
   Allowed Web Origins: http://localhost:8080, https://tu-dominio.com
   Allowed Origins (CORS): http://localhost:8080, https://tu-dominio.com
   ```
4. Habilita **Google** en Authentication → Social
5. Copia tu **Domain** y **Client ID**

### 2. **Actualizar Credenciales**

Edita `config.js`:
```javascript
AUTH0: {
    domain: 'tu-domain.auth0.com',     // ← Tu dominio aquí
    clientId: 'tu-client-id-aqui',     // ← Tu Client ID aquí
    // resto igual
}
```

### 3. **Sistema de Base de Datos Global (Opcional)**

Para base de datos real en lugar de localStorage:

1. **Opción A - Firebase (Gratis):**
   - Crea proyecto en [Firebase](https://firebase.google.com)
   - Actualiza `firebase-config.js` con tus credenciales
   - Descomenta las líneas de Firebase en el código

2. **Opción B - JSONBin (Gratis):**
   - Regístrate en [jsonbin.io](https://jsonbin.io)
   - Obtén tu API key
   - Actualiza `firebase-config.js` con tu API key
   - Descomenta las líneas de la API

3. **Opción C - Tu propio backend:**
   - Crea endpoints para GET/POST del scoreboard
   - Actualiza las funciones en `BasesDatosGlobal`

## 🎮 **Cómo Funciona**

### **Para Usuarios:**
1. **Abren la página** → Ven botón "Continuar con Google"
2. **Hacen login** → Sistema detecta su país automáticamente  
3. **Juegan Wordle** → Su progreso se guarda globalmente
4. **Compiten mundialmente** → Aparecen en ranking global con su bandera

### **Sistema Global:**
- **Detección de país** automática por IP
- **Banderas** automáticas (🇦🇷🇪🇸🇲🇽🇨🇴 etc.)
- **Ranking en tiempo real** actualizado después de cada partida
- **Top 1000 mundial** con medallas para los mejores
- **Datos persistentes** que sobreviven entre sesiones

## 🌟 **Funcionalidades Destacadas**

### 🏆 **Scoreboard Global**
```
🥇 1. María García 🇪🇸     - 47🔥 (892 partidas)
🥈 2. Juan López 🇦🇷      - 43🔥 (756 partidas) 
🥉 3. Ana Silva 🇲🇽       - 41🔥 (623 partidas)
   4. Carlos Ruiz 🇨🇴     - 38🔥 (445 partidas)
   5. Sofia Chen 🇺🇸      - 35🔥 (567 partidas)
```

### 🔐 **Autenticación Segura**
- **OAuth2 con Google** - máxima seguridad
- **Sesiones persistentes** - no necesitas reloguearte
- **Datos únicos por usuario** - tu progreso solo tuyo
- **Sin contraseñas** - todo a través de Google

### 🌍 **Detección Geográfica**
- **IP→País automático** usando API gratuita
- **+50 banderas** de países hispanohablantes y más
- **Información cultural** para crear comunidad

## 📊 **Estadísticas que se Guardan**

Por cada usuario:
- ✅ **Racha actual y máxima**
- ✅ **Total de partidas jugadas**  
- ✅ **Fecha de primera partida**
- ✅ **País de origen**
- ✅ **Avatar de Google**
- ✅ **Ranking global**

## 🚀 **Despliegue en Producción**

### **GitHub Pages (Gratis):**
1. Sube el código a GitHub
2. Activa GitHub Pages en Settings
3. Actualiza Auth0 con tu URL de GitHub Pages
4. ¡Listo! Tu juego estará disponible globalmente

### **Otros servicios:**
- **Vercel** - Deploy automático
- **Netlify** - CDN global gratis
- **Firebase Hosting** - Ultrarrápido

## 🔧 **Solución de Problemas**

### ❌ **"Auth0 SDK no se carga"**
- Verifica conexión a internet
- Revisa que CDN de Auth0 esté accesible
- Abre consola del navegador para ver errores

### ❌ **"Error de CORS en Auth0"**
- Verifica URLs en Auth0 Dashboard
- Asegúrate de usar http://localhost:8080 (no 127.0.0.1)
- Guarda cambios en Auth0

### ❌ **"No aparezco en el ranking"**
- Solo usuarios con Google login aparecen en ranking global
- Modo invitado es solo local
- Verifica que hayas jugado al menos una partida

## 🎯 **Próximos Pasos Recomendados**

1. **📱 PWA**: Convertir en app instalable
2. **🏅 Logros**: Sistema de achievements 
3. **👥 Amigos**: Seguir otros jugadores
4. **📈 Estadísticas**: Gráficos de progreso
5. **🌐 i18n**: Múltiples idiomas
6. **⚡ WebSockets**: Actualizaciones en tiempo real

## 🌟 **¡Tu Wordle Ahora es Global!**

Cualquier persona en el mundo puede:
- 🔗 Abrir tu URL
- 🔐 Hacer login con Google  
- 🎮 Jugar Wordle en español
- 🏆 Competir en el ranking mundial
- 🌍 Ver jugadores de otros países

**¡Comparte la URL y que comience la competencia global!** 🚀🌍 