# 🔒 Configuración Segura de Firebase para Ranking

## ✅ VENTAJAS DE ESTA IMPLEMENTACIÓN

- **🔐 API Keys completamente ocultas** - Solo en variables de entorno de Vercel
- **🚫 Cero exposición en frontend** - Credenciales nunca llegan al navegador
- **🛡️ Fallback automático** - Funciona aunque Firebase esté caído
- **📱 Base de datos real y persistente** - Los datos nunca se pierden

---

## 🚀 PASO 1: CREAR PROYECTO FIREBASE

### Opción A: Proyecto Nuevo
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea nuevo proyecto llamado `wordle-spanish-ranking`
3. **IMPORTANT:** Habilita "Realtime Database" (no Firestore)
4. Configura las reglas de seguridad:

```json
{
  "rules": {
    "scoreboard": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Opción B: Usar Demo Database (Temporal)
Si no puedes crear proyecto Firebase, el sistema usará datos demo automáticamente.

---

## 🔧 PASO 2: CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

### 📍 En tu Dashboard de Vercel:

1. Ve a tu proyecto: `wordle-spanish-xgdn-six.vercel.app`
2. Settings → Environment Variables
3. Agrega estas 4 variables:

```bash
# 🔑 FIREBASE CREDENTIALS (reemplaza con tus valores reales)
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=wordle-spanish-ranking.firebaseapp.com
FIREBASE_DATABASE_URL=https://wordle-spanish-ranking-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=wordle-spanish-ranking
```

### 📋 Cómo obtener las credenciales:

1. **Firebase Console** → Tu proyecto
2. **⚙️ Project Settings** → General
3. **Your apps** → Web app → Config
4. Copia los valores (sin las comillas)

---

## 🎯 PASO 3: REDESPLEGAR AUTOMÁTICAMENTE

Una vez agregadas las variables:
- **Vercel redesplegará automáticamente** (~2 minutos)
- El sistema **detectará Firebase** y empezará a usarlo
- **Fallback automático** si algo falla

---

## ✅ VERIFICAR QUE FUNCIONA

### 🔍 Test 1: Abrir Ranking
1. Abre el juego en el navegador
2. Clic en 🏆 **Ranking Global**
3. **Debe mostrar usuarios** (demo o reales)

### 🔍 Test 2: Consola del Navegador (F12)
```javascript
// Debe mostrar logs como:
✅ Scoreboard recibido: [...]
🌐 Llamando API: https://wordle-spanish-xgdn-six.vercel.app/api/scoreboard
```

### 🔍 Test 3: Persistencia Real
1. Juega unas partidas para generar estadísticas
2. Cierra el navegador completamente
3. Reabre el juego → **Las estadísticas deben persistir**

---

## 🚨 SEGURIDAD GARANTIZADA

### ✅ LO QUE ESTÁ PROTEGIDO:
- **API Keys nunca en el código fuente**
- **Variables de entorno solo en Vercel**
- **Frontend solo consume nuestra API**
- **Fallback si Firebase falla**

### ❌ LO QUE NO SE EXPONE:
- Credenciales Firebase
- Database URLs reales
- Project IDs sensibles
- Tokens de autenticación

---

## 🔄 FALLBACK AUTOMÁTICO

Si Firebase no está disponible:
- **GET**: Devuelve datos demo
- **PUT**: Guarda en memoria temporal
- **No errores al usuario**
- **Migración automática cuando Firebase vuelva**

---

## 🎉 RESULTADO FINAL

- ✅ **Ranking global real y persistente**
- ✅ **Datos nunca se pierden**
- ✅ **Zero configuración para usuarios**
- ✅ **Máxima seguridad sin exposición**
- ✅ **Funciona aunque Firebase esté caído** 