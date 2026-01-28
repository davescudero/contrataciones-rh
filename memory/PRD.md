# Sistema de Reclutamiento Interno - PRD

## Problema Original
Crear una aplicación web fullstack para un sistema interno de seguimiento de procesos de reclutamiento usando Supabase.

## Arquitectura
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Auth**: Supabase Auth (email/password)
- **Database**: Supabase (PostgreSQL) - tablas existentes
- **Storage**: Supabase Storage (bucket "cvs" para PDFs)
- **Diseño**: Neutral gray, tipografía Public Sans/IBM Plex Sans, interfaz en español

## Roles del Sistema
| Rol | Descripción |
|-----|-------------|
| PLANEACION | Crear y configurar campañas (DRAFT) |
| ATENCION_SALUD | Revisar y aprobar campañas (UNDER_REVIEW → APPROVED/DRAFT) |
| RH | Activar/desactivar campañas, dashboard y reportes |
| COORD_ESTATAL | Crear propuestas con CV para campañas activas |
| VALIDADOR | Validar propuestas (aprobar/rechazar con motivo) |
| DG | Dashboard ejecutivo (solo lectura) |

## Estados de Campaña
```
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE → INACTIVE
```

## Estados de Propuesta
```
SUBMITTED → IN_VALIDATION → APPROVED / REJECTED
```

## Lo que se implementó (28/01/2025)

### Flujo completo MVP
- ✅ Login con Supabase Auth
- ✅ Home con navegación basada en roles
- ✅ Mensaje claro cuando usuario no tiene roles

### PLANEACION
- ✅ Lista de campañas
- ✅ Crear nueva campaña (DRAFT)
- ✅ Editar campaña (solo DRAFT)
- ✅ Configurar posiciones desde positions_catalog
- ✅ Configurar CLUES autorizadas (validación contra health_facilities)
- ✅ Asignar unidades validadoras por posición
- ✅ Enviar a revisión (DRAFT → UNDER_REVIEW)

### ATENCION_SALUD
- ✅ Lista de campañas en revisión
- ✅ Resumen de campaña (posiciones, plazas, CLUES)
- ✅ Aprobar programa (→ APPROVED)
- ✅ Regresar a Planeación (→ DRAFT)

### RH
- ✅ Lista de campañas APPROVED/ACTIVE/INACTIVE
- ✅ Activar campaña (APPROVED → ACTIVE)
- ✅ Desactivar campaña (ACTIVE → INACTIVE)
- ✅ Dashboard con KPIs
- ✅ Exportar propuestas a CSV

### COORD_ESTATAL
- ✅ Ver campañas activas
- ✅ Crear propuesta con:
  - Selección de posición
  - Selección de CLUES
  - Validación de CURP (regex completo)
  - Subida de CV (PDF) a Supabase Storage
- ✅ Crear registros en files, proposals, proposal_validations
- ✅ Ver mis propuestas y su estado
- ✅ Ver motivo de rechazo cuando aplica

### VALIDADOR
- ✅ Ver propuestas pendientes de validación
- ✅ Ver CV con URL firmada (5 min expiration)
- ✅ Aprobar propuesta
- ✅ Rechazar con motivo obligatorio
- ✅ Lógica de aprobación/rechazo automática

### DG
- ✅ Dashboard ejecutivo
- ✅ Campañas por estado
- ✅ Propuestas por estado
- ✅ Sin acceso a CVs

## Tablas Supabase Utilizadas
- users, roles, user_roles
- campaigns
- positions_catalog
- health_facilities
- campaign_positions
- campaign_authorized_facilities
- campaign_validators
- validator_units
- user_validator_units
- proposals
- proposal_validations
- files

## Backlog

### P0 (Bloqueante)
- Ninguno para MVP

### P1 (Alta prioridad)
- Filtro de CLUES por estado del usuario en COORD_ESTATAL
- Paginación en tablas
- Edición de propuestas antes de validación

### P2 (Media prioridad)
- Notificaciones por email
- Historial de cambios
- Búsqueda en tablas

### P3 (Baja prioridad)
- Modo oscuro
- Reportes avanzados
- Dashboard con gráficas

## Próximas Acciones
1. Crear usuarios de prueba en Supabase Auth
2. Asignar roles en tabla user_roles
3. Configurar RLS policies si es necesario
4. Probar flujo completo con datos reales
