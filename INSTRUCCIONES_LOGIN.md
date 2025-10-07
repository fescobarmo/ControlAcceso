# 🔐 Instrucciones de Login - ControlAcceso

## ✅ Frontend y Backend Actualizados

**Última actualización**: 7 de Octubre, 2025  
**Estado**: ✅ Frontend y Backend sincronizados

---

## 🌐 URLs Actualizadas

### Frontend (Producción)
```
https://controlacceso-frontend.vercel.app
```

**Última versión desplegada**:
```
https://controlacceso-frontend-495bxycmj-fescobarmo-gmailcoms-projects.vercel.app
```

### Backend (Producción)
```
https://controlacceso-backend-d0uezs488-fescobarmo-gmailcoms-projects.vercel.app
```

---

## 🔑 Credenciales de Acceso

### Usuario Demo (Admin)
- **Email**: `admin@demo.com`
- **Contraseña**: `demo123`
- **Rol**: Administrador

---

## 📝 Cómo Hacer Login

### Paso 1: Acceder al Frontend
1. Abre tu navegador
2. Ve a: `https://controlacceso-frontend.vercel.app`
3. Espera a que cargue completamente la página

### Paso 2: Ingresar Credenciales
1. En el campo **Email**, ingresa: `admin@demo.com`
2. En el campo **Contraseña**, ingresa: `demo123`
3. Haz clic en el botón **Iniciar Sesión** o presiona `Enter`

### Paso 3: Acceso Exitoso
Si todo funciona correctamente, deberías:
- ✅ Ver un mensaje de "Login exitoso"
- ✅ Ser redirigido al Dashboard
- ✅ Ver tu nombre de usuario en la barra superior
- ✅ Tener acceso a las funcionalidades de administrador

---

## 🔍 Verificar que Todo Funciona

### Opción 1: Desde la Consola del Navegador
1. Abre DevTools (F12 o clic derecho → Inspeccionar)
2. Ve a la pestaña **Console**
3. Deberías ver mensajes como:
   ```
   🔧 Configuración de la aplicación:
   📊 API_BASE_URL: https://controlacceso-backend-d0uezs488-fescobarmo-gmailcoms-projects.vercel.app
   🚀 Request: POST /api/auth/login
   ✅ Response: 200 /api/auth/login
   ```

### Opción 2: Ver las Peticiones de Red
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Busca la petición a `/api/auth/login`
5. Debería mostrar:
   - **Status**: `200 OK`
   - **Response**: JSON con token y datos del usuario

---

## 🚨 Si El Login No Funciona

### 1. Verificar la URL del Backend
Abre la consola del navegador y busca:
```
📊 API_BASE_URL: https://controlacceso-backend-d0uezs488...
```

Si ves una URL diferente (por ejemplo, `hu4iponzv`), el frontend está usando una versión antigua.

**Solución**: Espera unos minutos y recarga la página con `Ctrl+Shift+R` (o `Cmd+Shift+R` en Mac)

### 2. Verificar CORS
Si ves un error de CORS en la consola:
```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Solución**: El backend está correctamente configurado, solo espera unos minutos para que Vercel propague los cambios.

### 3. Error de Credenciales
Si ves "Credenciales inválidas":
- ✅ Verifica que estés usando: `admin@demo.com` (no `admin` solo)
- ✅ Verifica la contraseña: `demo123` (case-sensitive)
- ✅ Asegúrate de que ambos campos estén completamente llenos

### 4. Error de Red
Si ves "Network Error":
- ✅ Verifica tu conexión a internet
- ✅ Recarga la página
- ✅ Limpia el caché del navegador

---

## 🧪 Probar el Backend Directamente

Puedes probar que el backend funciona usando curl o Postman:

```bash
curl -X POST "https://controlacceso-backend-d0uezs488-fescobarmo-gmailcoms-projects.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://controlacceso-frontend.vercel.app" \
  -d '{"email":"admin@demo.com","password":"demo123"}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@demo.com",
    "nombre": "Admin",
    "apellido": "Demo",
    "role": "admin"
  }
}
```

---

## 📊 Health Check del Backend

Para verificar que el backend está funcionando:

```bash
curl https://controlacceso-backend-d0uezs488-fescobarmo-gmailcoms-projects.vercel.app/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T...",
  "database": "connected",
  "environment": "production",
  "version": "2.0.0-serverless"
}
```

---

## ⏱️ Tiempo de Propagación

Después de un deployment, Vercel puede tardar:
- **1-2 minutos**: Para actualizar el contenido
- **5-10 minutos**: Para propagar los cambios globalmente

Si acabas de hacer el deployment, **espera 2-3 minutos** y luego:
1. Recarga la página con `Ctrl+Shift+R`
2. Limpia el caché si es necesario
3. Intenta hacer login nuevamente

---

## 📱 Navegadores Compatibles

El sistema ha sido probado y funciona en:
- ✅ Chrome (v90+)
- ✅ Firefox (v85+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)

---

## 🆘 Soporte

Si después de seguir estas instrucciones el login aún no funciona:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Copia el error completo**
3. **Verifica que estás usando las URLs correctas**
4. **Intenta desde modo incógnito** (para descartar problemas de caché)

---

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] ✅ Estoy usando la URL correcta del frontend
- [ ] ✅ Las credenciales son: `admin@demo.com` / `demo123`
- [ ] ✅ He esperado al menos 2 minutos después del deployment
- [ ] ✅ He recargado la página con Ctrl+Shift+R
- [ ] ✅ La consola del navegador muestra la URL correcta del backend
- [ ] ✅ No hay errores de CORS en la consola
- [ ] ✅ Mi conexión a internet funciona correctamente

---

**¡Si sigues estas instrucciones, el login debería funcionar perfectamente!** 🎉
