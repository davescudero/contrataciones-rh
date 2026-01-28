# Accesos Necesarios - Sistema de Reclutamiento Interno

**Fecha de Creación**: 28 de Enero 2025  
**Rama de Trabajo**: `davescudero-dev`  
**Autor**: Dave Escudero

---

## 📋 Resumen

Este documento lista todos los accesos y configuraciones necesarias para trabajar en el proyecto de Contrataciones RH.

---

## 🔐 Accesos Requeridos

### 1. Supabase (Base de Datos y Autenticación)

| Acceso | Tipo | Prioridad | Estado |
|--------|------|-----------|--------|
| Dashboard de Supabase | Lectura/Escritura | **CRÍTICO** | ⏳ Pendiente |
| URL del proyecto | Variable de entorno | **CRÍTICO** | ⏳ Pendiente |
| Anon Key | Variable de entorno | **CRÍTICO** | ⏳ Pendiente |
| Service Role Key | Variable de entorno (backend) | **ALTA** | ⏳ Pendiente |

**Variables de entorno necesarias para Frontend**:
```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Acciones en Supabase**:
- [ ] Crear usuarios de prueba
- [ ] Asignar roles en tabla `user_roles`
- [ ] Configurar RLS policies
- [ ] Revisar estructura de Storage buckets

---

### 2. MongoDB (Backend actual)

| Acceso | Tipo | Prioridad | Estado |
|--------|------|-----------|--------|
| MongoDB Atlas / Local | Conexión | **ALTA** | ⏳ Pendiente |
| Nombre de base de datos | Variable de entorno | **ALTA** | ⏳ Pendiente |

**Variables de entorno necesarias para Backend**:
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=contrataciones_rh
CORS_ORIGINS=http://localhost:3000,https://app.domain.com
```

---

### 3. GitHub

| Acceso | Tipo | Prioridad | Estado |
|--------|------|-----------|--------|
| Push a repositorio | Escritura | **CRÍTICO** | ✅ Configurado |
| Acceso a Issues | Lectura/Escritura | **MEDIA** | ⏳ Verificar |
| GitHub Actions | Configuración | **ALTA** | ⏳ Pendiente |
| Secrets del repositorio | Configuración | **ALTA** | ⏳ Pendiente |

**Secrets de GitHub necesarios para CI/CD**:
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
MONGO_URL
```

---

### 4. Servicios Externos (Opcionales/Futuros)

| Servicio | Propósito | Prioridad |
|----------|-----------|-----------|
| SendGrid / Resend | Notificaciones email | MEDIA |
| Vercel / Netlify | Hosting frontend | BAJA |
| Railway / Render | Hosting backend | BAJA |

---

## 🖥️ Entorno de Desarrollo Local

### Requisitos de Sistema

| Herramienta | Versión Mínima | Verificar |
|-------------|----------------|-----------|
| Node.js | 18.x | `node --version` |
| Yarn | 1.22.x | `yarn --version` |
| Python | 3.10+ | `python --version` |
| pip | Última | `pip --version` |

### Pasos de Configuración

#### Frontend
```bash
cd frontend
cp .env.example .env  # Crear archivo con credenciales
yarn install
yarn start
```

#### Backend
```bash
cd backend
cp .env.example .env  # Crear archivo con credenciales
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

---

## 👥 Usuarios de Prueba Necesarios

Para pruebas completas del sistema, necesitamos usuarios con cada rol:

| Email (sugerido) | Rol | Propósito |
|------------------|-----|-----------|
| planeacion@test.com | PLANEACION | Crear campañas |
| atencion@test.com | ATENCION_SALUD | Aprobar campañas |
| rh@test.com | RH | Activar campañas, reportes |
| coord@test.com | COORD_ESTATAL | Crear propuestas |
| validador@test.com | VALIDADOR | Validar propuestas |
| dg@test.com | DG | Dashboard ejecutivo |
| admin@test.com | Todos los roles | Testing completo |

---

## 📝 Checklist de Configuración Inicial

### Antes de comenzar desarrollo:

- [ ] Obtener credenciales de Supabase del propietario del proyecto
- [ ] Verificar acceso al repositorio GitHub
- [ ] Crear archivos `.env` locales con credenciales
- [ ] Verificar conexión a Supabase desde frontend
- [ ] Verificar conexión a MongoDB desde backend (si aplica)
- [ ] Crear al menos un usuario de prueba por cada rol
- [ ] Probar flujo de login completo

### Para CI/CD:

- [ ] Configurar secrets en GitHub repository settings
- [ ] Crear archivo `.github/workflows/ci.yml`
- [ ] Verificar permisos de GitHub Actions

---

## 🚨 Contactos para Solicitar Accesos

| Recurso | Contacto | Método |
|---------|----------|--------|
| Supabase | [Propietario del proyecto] | Slack / Email |
| GitHub | [Admin del repositorio] | GitHub |
| MongoDB | [Admin de infraestructura] | Email |

---

## 📊 Estado de Accesos

| Categoría | Completado | Total | Porcentaje |
|-----------|------------|-------|------------|
| Supabase | 0 | 4 | 0% |
| MongoDB | 0 | 2 | 0% |
| GitHub | 1 | 4 | 25% |
| **Total** | **1** | **10** | **10%** |

---

## ⚠️ Notas Importantes

1. **Nunca** commitear credenciales al repositorio
2. Los archivos `.env` están en `.gitignore`
3. Para producción, usar variables de entorno del hosting
4. Las Service Role Keys de Supabase **solo** deben usarse en backend
5. Rotar credenciales regularmente según políticas de seguridad
