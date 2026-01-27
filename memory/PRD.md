# Sistema de Reclutamiento Interno - PRD

## Problema Original
Crear una aplicación web fullstack para un sistema interno de seguimiento de procesos de reclutamiento.

## Requisitos Técnicos
- Supabase para autenticación, base de datos y almacenamiento de archivos
- Autenticación con email y contraseña usando Supabase Auth
- Control de acceso basado en roles (RBAC) a nivel de aplicación
- Aplicación segura para uso interno institucional

## Entidades Core (existen en Supabase)
- users, roles, user_roles
- campaigns
- positions_catalog
- health_facilities
- proposals
- proposal_validations
- files

## Roles del Sistema
- **admin**: Administrador con acceso total
- **hr_manager**: Gestor de RH
- **validator**: Validador de propuestas
- **viewer**: Visualizador (solo lectura)
- **state_coordinator**: Coordinador Estatal

## Arquitectura
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Auth**: Supabase Auth (email/password)
- **Database**: Supabase (PostgreSQL)
- **Diseño**: Neutral gray, tipografía Public Sans/IBM Plex Sans

## Lo que se implementó (27/01/2025)
- ✅ Página de login con validación de formularios
- ✅ Autenticación con Supabase Auth
- ✅ Contexto de autenticación con gestión de sesión
- ✅ Obtención de roles de usuario desde tabla user_roles
- ✅ Página Home con menú basado en roles
- ✅ Página de Campañas (lectura + creación de borradores)
- ✅ Layout con navegación responsive
- ✅ Rutas protegidas con RBAC
- ✅ Interfaz en español
- ✅ Diseño profesional neutral gray

## Backlog Priorizado

### P0 (Crítico)
- Ninguno pendiente para MVP

### P1 (Alta prioridad)
- Página de Propuestas (CRUD completo)
- Página de Validaciones
- Filtros y búsqueda en tablas
- Edición de campañas existentes

### P2 (Media prioridad)
- Página de Unidades de Salud
- Página de administración de usuarios
- Subida de archivos a Supabase Storage
- Historial de cambios/auditoría

### P3 (Baja prioridad)
- Dashboard con estadísticas
- Notificaciones
- Reportes exportables
- Modo oscuro

## Próximas Acciones
1. Implementar página de Propuestas con CRUD completo
2. Agregar validaciones de propuestas
3. Conectar catálogo de posiciones en creación de campañas
4. Implementar filtros en tablas
