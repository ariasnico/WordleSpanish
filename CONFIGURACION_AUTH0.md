# Configuración de Auth0 para Wordle en Español

## Pasos para configurar Auth0

### 1. Crear cuenta en Auth0
1. Ve a [auth0.com](https://auth0.com) y crea una cuenta gratuita
2. Crea un nuevo tenant (inquilino) para tu aplicación

### 2. Configurar la aplicación
1. En el dashboard de Auth0, ve a **Applications** > **Applications**
2. Haz clic en **Create Application**
3. Nombre: `Wordle Español`
4. Tipo: **Single Page Web Applications**
5. Haz clic en **Create**

### 3. Configurar los URLs
En la pestaña **Settings** de tu aplicación:

- **Allowed Callback URLs**: `http://localhost:8080, https://tu-dominio.com`
- **Allowed Logout URLs**: `http://localhost:8080, https://tu-dominio.com`
- **Allowed Web Origins**: `http://localhost:8080, https://tu-dominio.com`
- **Allowed Origins (CORS)**: `http://localhost:8080, https://tu-dominio.com`

### 4. Configurar Google como proveedor social
1. Ve a **Authentication** > **Social**
2. Haz clic en **Create Connection**
3. Selecciona **Google**
4. Configura con tus credenciales de Google OAuth:
   - **Client ID**: Tu Google Client ID
   - **Client Secret**: Tu Google Client Secret
5. Habilita la conexión para tu aplicación

### 5. Obtener credenciales para el código
En la pestaña **Settings** de tu aplicación, copia:
- **Domain**
- **Client ID**

### 6. Actualizar el código
En `script.js`, actualiza la configuración:

```javascript
const AUTH0_CONFIG = {
    domain: 'tu-dominio.auth0.com', // Reemplaza con tu dominio
    clientId: 'tu-client-id',       // Reemplaza con tu Client ID
    redirectUri: window.location.origin,
    responseType: 'code',
    scope: 'openid profile email'
};
```

### 7. Configurar Google OAuth (opcional)
Si quieres configurar tu propia aplicación de Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **Google OAuth2 API**
4. Ve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://tu-dominio.auth0.com/login/callback`

## Funcionalidades implementadas

### Autenticación
- ✅ Login con Google a través de Auth0
- ✅ Modo invitado para jugar sin cuenta
- ✅ Logout seguro
- ✅ Persistencia de sesión

### Estadísticas de usuario
- ✅ Racha actual
- ✅ Racha máxima
- ✅ Número de partidas jugadas
- ✅ Guardado automático de estadísticas

### Scoreboard global
- ✅ Ranking de rachas máximas
- ✅ Top 100 jugadores
- ✅ Destacado del usuario actual
- ✅ Medallas para los primeros 3 lugares

### Almacenamiento
- 📁 **Usuarios autenticados**: Datos guardados por usuario con ID único
- 📁 **Modo invitado**: Datos guardados localmente
- 📁 **Scoreboard**: Simulado con localStorage (listo para backend)

## Próximos pasos recomendados

### Para producción:
1. **Backend real**: Reemplazar localStorage con una base de datos
2. **API REST**: Crear endpoints para estadísticas y scoreboard
3. **Validación**: Verificar partidas en el servidor
4. **Seguridad**: Implementar rate limiting y validaciones

### Estructura de API sugerida:
```
POST /api/user/stats     - Guardar estadísticas del usuario
GET  /api/user/stats     - Obtener estadísticas del usuario
GET  /api/scoreboard     - Obtener ranking global
POST /api/game/validate  - Validar resultado de partida
```

## Uso del sistema

### Como usuario autenticado:
1. Clic en "Continuar con Google"
2. Autorizar la aplicación
3. Jugar normalmente
4. Las estadísticas se guardan automáticamente
5. Ver ranking global con el botón 🏆

### Como invitado:
1. Clic en "Jugar como Invitado"
2. Las estadísticas se guardan localmente
3. No apareces en el ranking global
4. Puedes autenticarte más tarde para sincronizar

## Solución de problemas

### Error de configuración Auth0:
- Verifica que el dominio y clientId sean correctos
- Asegúrate de que los URLs estén configurados correctamente
- Revisa la consola del navegador para errores específicos

### Problemas de CORS:
- Agrega tu dominio a "Allowed Origins (CORS)" en Auth0
- Para desarrollo local, usa `http://localhost:8080` (no `127.0.0.1`)

### Scoreboard vacío:
- Es normal al inicio, las estadísticas se crean cuando los usuarios juegan
- En modo invitado no apareces en el ranking global 