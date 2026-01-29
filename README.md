# Sistema de Reclutamiento - Contrataciones RH

Sistema web para la gestión de campañas de reclutamiento interno con múltiples roles de usuario.

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com)

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo Local](#desarrollo-local)
- [Testing](#testing)
- [Deploy en Vercel](#deploy-en-vercel)
- [Roles del Sistema](#roles-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 📝 Descripción

Sistema interno de seguimiento de procesos de reclutamiento que permite:
- Crear y configurar campañas de reclutamiento
- Gestionar posiciones y CLUES autorizadas
- Crear y validar propuestas de candidatos
- Dashboards por rol con métricas clave

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Tailwind CSS + Shadcn/UI |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage (CVs en PDF) |
| Testing | Jest + React Testing Library |
| Deploy | Vercel |

---

## 📦 Requisitos

- **Node.js** 18.x o superior (recomendado: 20.x)
- **npm** 9.x o superior
- Cuenta en **Supabase** con proyecto configurado
- Cuenta en **Vercel** (para deploy)

Verificar versiones:
```bash
node --version  # v18.x o superior
npm --version   # 9.x o superior
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd contrataciones_rh
```

### 2. Instalar dependencias

```bash
cd frontend
npm install --legacy-peer-deps
```

> **Nota**: Se usa `--legacy-peer-deps` debido a dependencias de React 19.

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase (ver sección siguiente).

### 4. Iniciar servidor de desarrollo

```bash
npm start
```

La aplicación estará disponible en http://localhost:3000

---

## 🔐 Variables de Entorno

Crear archivo `frontend/.env` con las siguientes variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener credenciales de Supabase

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto
3. Ir a **Settings** → **API**
4. Copiar:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

---

## 💻 Desarrollo Local

```bash
cd frontend

# Iniciar servidor de desarrollo
npm start

# Ejecutar tests
npm test

# Build de producción
npm run build

# Linter
npm run lint
```

---

## 🧪 Testing

```bash
cd frontend

# Modo watch (desarrollo)
npm test

# Una sola ejecución
npm test -- --watchAll=false

# Con cobertura
npm test -- --coverage
```

**Estado actual**: 5 test suites, 33 tests pasando ✅

---

## ☁️ Deploy en Vercel

### Opción 1: Desde el Dashboard de Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Click en **"Add New..."** → **"Project"**
3. Importar el repositorio de GitHub
4. Configurar:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Agregar variables de entorno:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
6. Click en **Deploy**

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta frontend
cd frontend

# Login y deploy
vercel login
vercel --prod
```

### Configuración de Vercel (vercel.json)

Si necesitas configuración adicional, crear `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Re-deploy después de cambios

1. Hacer push a la rama `main`
2. Vercel detecta automáticamente y re-deploya

---

## 👥 Roles del Sistema

| Rol | Código | Funciones Principales |
|-----|--------|----------------------|
| Planeación | `PLANEACION` | Crear/editar campañas, configurar posiciones y CLUES |
| Atención a la Salud | `ATENCION_SALUD` | Revisar y aprobar/rechazar campañas |
| Recursos Humanos | `RH` | Activar/desactivar campañas, reportes, dashboard |
| Coordinación Estatal | `COORD_ESTATAL` | Crear propuestas de candidatos con CV |
| Validador | `VALIDADOR` | Validar propuestas (aprobar/rechazar) |
| Dirección General | `DG` | Dashboard ejecutivo (solo lectura) |

### Flujo de Estados

**Campañas:**
```
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE → INACTIVE
```

**Propuestas:**
```
SUBMITTED → IN_VALIDATION → APPROVED / REJECTED
```

---

## 📁 Estructura del Proyecto

```
contrataciones_rh/
├── frontend/                 # Aplicación React (principal)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes UI (Shadcn/UI)
│   │   │   └── ui/           # Componentes base
│   │   ├── contexts/         # AuthContext
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilidades, logger, supabase
│   │   └── pages/            # Páginas organizadas por rol
│   │       ├── planeacion/
│   │       ├── atencion-salud/
│   │       ├── rh/
│   │       ├── coordinacion/
│   │       ├── validador/
│   │       └── dg/
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # API FastAPI (opcional)
├── memory/                   # PRD y documentación técnica
└── README.md
```

---

## 📊 Tablas de Supabase

El sistema utiliza las siguientes tablas:

- `users`, `roles`, `user_roles` - Autenticación y autorización
- `campaigns` - Campañas de reclutamiento
- `positions_catalog` - Catálogo de posiciones
- `health_facilities` - Catálogo de CLUES
- `campaign_positions` - Posiciones por campaña
- `campaign_authorized_facilities` - CLUES autorizadas por campaña
- `campaign_validators` - Validadores asignados por posición
- `validator_units` - Unidades validadoras
- `proposals` - Propuestas de candidatos
- `proposal_validations` - Validaciones de propuestas
- `files` - Archivos (CVs)

---

## 🔧 Troubleshooting

### Error de dependencias al instalar

```bash
npm install --legacy-peer-deps
```

### Error de módulos no encontrados

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Tests fallan

```bash
rm -rf node_modules/.cache
npm test
```

---

## 📝 Contribuir

1. Crear rama desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Hacer cambios y commits descriptivos
3. Ejecutar tests: `npm test -- --watchAll=false`
4. Push y crear Pull Request a `main`

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.
