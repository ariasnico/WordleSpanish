# 🛠️ Guía de Desarrollo Local - Wordle Español

## 🔧 **Opciones para Probar Auth0 Localmente**

### **📋 Opción 1: Modo Invitado (Recomendado para desarrollo)**
```bash
python3 -m http.server 8080
```
- ✅ **Funciona completamente sin Auth0**
- ✅ **Guarda estadísticas locales**
- ✅ **Scoreboard local funcional**
- ✅ **Ideal para desarrollo de la lógica del juego**

---

### **🔒 Opción 2: HTTPS Local (Para probar Auth0)**
```bash
python3 server-https.py
```
- ✅ **Auth0 funciona completamente**
- ✅ **Login con Google real**
- ✅ **Scoreboard global**
- ⚠️ **Requiere aceptar certificado autofirmado**

**🌐 URL:** https://localhost:8443

---

## 🚨 **Problemas Comunes y Soluciones**

### **❌ Error: "auth0-spa-js must run on a secure origin"**
**Causa:** Auth0 v2.x requiere HTTPS

**Soluciones:**
1. **Usar servidor HTTPS:** `python3 server-https.py`
2. **Usar modo invitado:** Hace click en "Jugar como Invitado"
3. **Desplegar online:** GitHub Pages, Vercel, Netlify

---

### **❌ Error: "OpenSSL no encontrado"**
```bash
# Ubuntu/Debian
sudo apt install openssl

# O usa modo invitado
python3 -m http.server 8080
```

---

### **❌ Error: "Puerto en uso"**
```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :8080
sudo lsof -i :8443

# Matar proceso si es necesario
sudo kill -9 <PID>
```

---

## 🎮 **Funcionalidades Disponibles**

### **🎯 Modo Invitado (HTTP)**
- ✅ Juego completo de Wordle
- ✅ Estadísticas locales guardadas
- ✅ Racha máxima persistente
- ✅ Scoreboard local
- ✅ Temas claro/oscuro
- ✅ Validación de palabras en español

### **🌐 Modo Autenticado (HTTPS)**
- ✅ Todo del modo invitado +
- ✅ Login con Google
- ✅ Perfil de usuario
- ✅ Scoreboard global
- ✅ Competencia mundial
- ✅ Detección automática de países

---

## 🚀 **Comandos Rápidos**

```bash
# Desarrollo simple (modo invitado)
python3 -m http.server 8080

# Desarrollo con Auth0 (HTTPS)
python3 server-https.py

# Ver archivos del proyecto
ls -la

# Verificar puertos en uso
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8443
```

---

## 📱 **Para Probar en Móviles**

### **HTTP (modo invitado):**
```
http://TU_IP_LOCAL:8080
```

### **HTTPS (con Auth0):**
```
https://TU_IP_LOCAL:8443
```

**💡 Obtener tu IP local:**
```bash
ip addr show | grep inet
```

---

## 🔧 **Configuración Auth0**

**Domain:** `dev-odty0l3abcja7dfs.us.auth0.com`
**Client ID:** `Dt0d1zvYIVUgWfqyswJZGg84Ay98lkFc`

**URLs Permitidas:**
- `http://localhost:8080` (desarrollo HTTP)
- `https://localhost:8443` (desarrollo HTTPS)
- URLs de producción cuando se despliegue

---

## 🎯 **Para Qué Usar Cada Modo**

### **🎮 Usa Modo Invitado cuando:**
- Desarrolles la lógica del juego
- Pruebes nuevas funcionalidades
- No tengas OpenSSL disponible
- Quieras desarrollo rápido

### **🔒 Usa Modo HTTPS cuando:**
- Pruebes autenticación
- Verifiques el scoreboard global
- Simules la experiencia de producción
- Necesites probar con usuarios reales

---

## 🚀 **Siguiente Paso: Despliegue**

Una vez que el juego esté listo, despliégalo en:
- **GitHub Pages** (gratis, HTTPS automático)
- **Vercel** (gratis, HTTPS automático)  
- **Netlify** (gratis, HTTPS automático)

¡Y Auth0 funcionará perfectamente en producción! 🎉 