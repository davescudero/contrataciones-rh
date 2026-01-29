# Sistema de Reclutamiento - Contrataciones RH

Sistema web para la gestión de campañas de reclutamiento con múltiples roles de usuario.

## 📁 Estructura del Proyecto

```
contrataciones_rh/
├── backend/           # API con FastAPI (Python) - Opcional
├── frontend/          # Aplicación React (principal)
│   └── src/
│       ├── components/   # Componentes UI (Shadcn/UI)
│       ├── contexts/     # AuthContext
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utilidades, logger, supabase client
│       └── pages/        # Páginas por rol
├── memory/            # Documentación del proyecto (PRD)
├── PLAN_DE_MEJORA.md  # Roadmap y mejoras pendientes
└── design_guidelines.json
```

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Tailwind CSS + Shadcn/UI |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage (CVs) |
| Testing | Jest + React Testing Library |

## 👥 Roles del Sistema

| Rol | Código | Funciones |
|-----|--------|----------|
| Planeación | `PLANEACION` | Crear/editar campañas |
| Atención a la Salud | `ATENCION_SALUD` | Aprobar campañas |
| Recursos Humanos | `RH` | Activar campañas, reportes |
| Coordinación Estatal | `COORD_ESTATAL` | Crear propuestas |
| Validador | `VALIDADOR` | Validar propuestas |
| Dirección General | `DG` | Dashboard ejecutivo |

## 🚀 Desarrollo

### Requisitos
- Node.js 18+ (recomendado: 20.x)
- npm o yarn

### Frontend
```bash
cd frontend
cp .env.example .env  # Configurar variables de Supabase
npm install --legacy-peer-deps
npm start
```

La aplicación estará en http://localhost:3000

### Variables de Entorno
```env
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

## 🧪 Testing

```bash
cd frontend
npm test                    # Modo watch
npm test -- --watchAll=false  # Una ejecución
npm test -- --coverage      # Con cobertura
```

**Estado actual**: 5 test suites, 33 tests pasando

## 📋 Documentación

- [PRD](memory/PRD.md) - Requerimientos del producto
- [Plan de Mejora](PLAN_DE_MEJORA.md) - Roadmap y deuda técnica

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Shadcn/UI Docs](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)