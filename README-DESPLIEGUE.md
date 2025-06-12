# 🌍 Desplegar Wordle Español - Guía Completa

## 🎯 **Objetivo**
Hacer que cualquier persona del mundo pueda jugar tu Wordle desde **tu-juego.vercel.app**

---

## 🚀 **Opción 1: Vercel (Más Fácil)**

### **Paso 1: Crear cuenta en Vercel**
1. Ve a: https://vercel.com
2. Registrarte con tu cuenta de **GitHub**
3. Conecta tu repositorio

### **Paso 2: Subir tu código a GitHub**
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "🎮 Wordle Español con Auth0 completo"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/TU-USUARIO/wordle-español.git
git push -u origin main
```

### **Paso 3: Desplegar en Vercel**
1. En Vercel: **"New Project"**
2. Importa tu repositorio de GitHub
3. ✅ **Deploy** (automático)
4. Tu URL será: `https://wordle-español-TU-USUARIO.vercel.app`

---

## 🔧 **Paso 4: Actualizar Auth0**

Después del despliegue, ve a **Auth0 Dashboard**:

### **Application URIs - Agregar tu nueva URL:**
```
Allowed Callback URLs:
http://localhost:8080, https://localhost:8443, https://wordle-español-TU-USUARIO.vercel.app

Allowed Logout URLs:
http://localhost:8080, https://localhost:8443, https://wordle-español-TU-USUARIO.vercel.app

Allowed Web Origins:
http://localhost:8080, https://localhost:8443, https://wordle-español-TU-USUARIO.vercel.app
```

---

## 🌐 **Opciones Alternativas**

### **Opción 2: Netlify**
1. Ve a: https://netlify.com
2. Arrastra la carpeta del proyecto
3. Automáticamente tendrás: `https://tu-juego.netlify.app`

### **Opción 3: GitHub Pages**
1. En tu repositorio GitHub: **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. URL: `https://TU-USUARIO.github.io/wordle-español`

---

## 🔒 **Certificado SSL Automático**

✅ **En producción (Vercel/Netlify)**: Certificado SSL **automático y válido**
✅ **Chrome mostrará**: 🔒 **Seguro** (desaparece el "no seguro")
✅ **Auth0 funcionará**: Sin problemas de origen seguro

---

## 📱 **Compartir con Amigos**

Una vez desplegado, tus amigos pueden:

### **Desde Argentina 🇦🇷**
```
https://wordle-español-TU-USUARIO.vercel.app
```

### **Desde España 🇪🇸**
```
https://wordle-español-TU-USUARIO.vercel.app
```

### **Desde México 🇲🇽**
```
https://wordle-español-TU-USUARIO.vercel.app
```

### **Desde cualquier país 🌍**
- ✅ **Misma URL para todos**
- ✅ **Login con Google automático**
- ✅ **Detección de país por IP**
- ✅ **Competencia global en tiempo real**

---

## 🏆 **Resultado Final**

### **URL Local (solo para ti):**
```
https://localhost:8443
```

### **URL Mundial (para todos):**
```
https://wordle-español-TU-USUARIO.vercel.app
```

### **Funcionalidades:**
✅ Cualquier persona puede registrarse con Google  
✅ Ranking mundial automático  
✅ Detección de países (🇦🇷🇪🇸🇲🇽🇨🇴🇺🇸🇧🇷🇫🇷🇮🇹...)  
✅ Estadísticas persistentes  
✅ Certificado SSL válido  
✅ Scoreboard global en tiempo real

---

## 🚨 **Importante**

1. **Mantén las dos URLs**: localhost para desarrollo, vercel para producción
2. **Auth0 funcionará en ambas**: después de actualizar las URLs
3. **Base de datos compartida**: todos los usuarios competirán en el mismo ranking
4. **Racha global**: tu racha actual se mantendrá 