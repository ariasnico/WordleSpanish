# 🔐 Configuración Detallada de Auth0

## 🚨 **PROBLEMA ACTUAL**
**Error:** "Callback URL mismatch - https://localhost:8443 is not in the list of allowed callback URLs"

**Causa:** Necesitas agregar la URL HTTPS a tu configuración de Auth0.

---

## 🛠️ **SOLUCIÓN PASO A PASO**

### **1. Acceder al Auth0 Dashboard**
1. Ve a: https://manage.auth0.com/
2. Inicia sesión con tu cuenta de Auth0
3. Selecciona tu tenant

### **2. Encontrar tu Aplicación**
1. En el menú lateral: **Applications → Applications**
2. Busca la aplicación con:
   - **Name:** Tu app de Wordle
   - **Client ID:** `Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc`
3. Haz clic en el nombre de la aplicación

### **3. Configurar URLs Permitidas**

En la pestaña **Settings**, ve a la sección **Application URIs** y configura:

#### **🔄 Allowed Callback URLs:**
```
http://localhost:8080,https://localhost:8443
```

#### **🚪 Allowed Logout URLs:**
```
http://localhost:8080,https://localhost:8443
```

#### **🌐 Allowed Web Origins:**
```
http://localhost:8080,https://localhost:8443
```

#### **🔗 Allowed Origins (CORS):**
```
http://localhost:8080,https://localhost:8443
```

### **4. Configurar Conexión Google**
1. Ve a **Connections → Social**
2. Busca **Google** y haz clic en el ⚙️
3. En **Applications**, asegúrate de que tu app esté habilitada
4. **Guarda los cambios**

### **5. Guardar Configuración**
1. Scroll hasta abajo
2. Haz clic en **Save Changes**
3. Espera la confirmación verde

---

## 🧪 **PROBAR LA CONFIGURACIÓN**

### **Paso 1: Reiniciar servidor HTTPS**
```bash
# Detener servidor actual (Ctrl+C)
# Iniciar de nuevo
python3 server-https.py
```

### **Paso 2: Abrir la aplicación**
1. Ve a: **https://localhost:8443**
2. Acepta el certificado autofirmado
3. Haz clic en **"Continuar con Google"**
4. ¡Debería funcionar! 🎉

---

## 🔧 **CONFIGURACIONES ADICIONALES**

### **Para Producción (cuando desplegues):**
Agrega también estas URLs cuando tengas tu dominio:
```
https://tu-dominio.com
https://tu-dominio.vercel.app
https://tu-usuario.github.io
```

### **Para Desarrollo en Red Local:**
Si quieres probar desde otros dispositivos:
```
https://TU_IP_LOCAL:8443
```

---

## 🚨 **ERRORES COMUNES**

### **❌ "Invalid state parameter"**
- **Causa:** Caché corrupto
- **Solución:** Borra caché del navegador

### **❌ "Access denied"**
- **Causa:** Google OAuth no configurado
- **Solución:** Verifica la conexión Google en Auth0

### **❌ "Client authentication failed"**
- **Causa:** Client ID incorrecto
- **Solución:** Verifica el Client ID en config.js

---

## 📱 **CONFIGURACIÓN GOOGLE OAUTH**

Si necesitas configurar Google OAuth desde cero:

1. **Ve a Google Cloud Console:** https://console.cloud.google.com/
2. **Crea un proyecto** o selecciona uno existente
3. **Habilita Google+ API**
4. **Crea credenciales OAuth 2.0**
5. **Agrega URIs autorizados:**
   ```
   https://dev-odty0l3abcja7dfs.us.auth0.com/login/callback
   ```
6. **Copia Client ID y Secret a Auth0**

---

## ✅ **CHECKLIST FINAL**

- [ ] URLs agregadas en Auth0 Dashboard
- [ ] Configuración guardada
- [ ] Servidor HTTPS funcionando
- [ ] Certificado aceptado en navegador
- [ ] Google OAuth configurado
- [ ] Conexión Google habilitada en Auth0

---

## 🆘 **SI SIGUE SIN FUNCIONAR**

1. **Verifica la consola del navegador** (F12)
2. **Comparte el error específico**
3. **Verifica que las URLs coincidan exactamente**
4. **Prueba en ventana de incógnito**

## 🎯 **CONFIGURACIÓN FINAL ESPERADA**

Una vez configurado correctamente, deberías ver:
- ✅ Login con Google funcional
- ✅ Perfil de usuario cargado
- ✅ Estadísticas guardadas
- ✅ Scoreboard global
- ✅ Detección automática de país

¡El sistema estará completamente funcional! 🚀 