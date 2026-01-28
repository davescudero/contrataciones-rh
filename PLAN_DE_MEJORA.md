# Plan de Mejora - Sistema de Reclutamiento Interno

**Fecha de Creación**: 28 de Enero 2025  
**Rama de Trabajo**: `davescudero-dev`  
**Autor**: Dave Escudero

---

## 📋 Resumen Ejecutivo

Este documento presenta un plan estructurado de mejoras para el Sistema de Reclutamiento Interno (Contrataciones RH), basado en una revisión exhaustiva del código actual, la documentación existente y las mejores prácticas de desarrollo.

---

## 🏗️ Estado Actual del Proyecto

### Arquitectura Implementada

| Componente | Tecnología | Estado |
|------------|------------|--------|
| Frontend | React 19 + Tailwind CSS + Shadcn/UI | ✅ MVP Funcional |
| Autenticación | Supabase Auth | ✅ Implementado |
| Base de Datos | Supabase (PostgreSQL) | ✅ Estructurada |
| Storage | Supabase Storage (bucket "cvs") | ✅ Configurado |
| Backend API | FastAPI + MongoDB | ⚠️ Inconsistente con PRD |

### Funcionalidades MVP Completadas

- ✅ Login con Supabase Auth
- ✅ Sistema de roles (PLANEACION, ATENCION_SALUD, RH, COORD_ESTATAL, VALIDADOR, DG)
- ✅ Gestión de campañas (crear, editar, enviar a revisión)
- ✅ Flujo de aprobación de campañas
- ✅ Creación de propuestas con validación CURP y subida de CV
- ✅ Validación de propuestas (aprobar/rechazar)
- ✅ Dashboards básicos para RH y DG

---

## 🎯 Plan de Mejoras

### Fase 1: Infraestructura y Calidad de Código (Prioridad Alta)

#### 1.1 Unificación de Backend
**Problema**: El PRD especifica Supabase PostgreSQL pero el backend usa MongoDB/FastAPI.

**Acciones**:
- [ ] Evaluar si se requiere el backend FastAPI o si Supabase es suficiente
- [ ] Si se mantiene FastAPI: migrar de MongoDB a Supabase PostgreSQL
- [ ] Documentar decisión arquitectónica

#### 1.2 Testing
**Estado Actual**: Directorio `tests/` existe pero está vacío.

**Acciones**:
- [ ] Implementar tests unitarios para frontend (Jest + React Testing Library)
- [ ] Implementar tests de integración para API
- [ ] Agregar tests E2E con Playwright o Cypress
- [ ] Configurar coverage mínimo (80%)

#### 1.3 CI/CD
**Acciones**:
- [ ] Configurar GitHub Actions para:
  - Linting (ESLint, Black, Flake8)
  - Testing automatizado
  - Build verification
  - Deploy automático a staging

#### 1.4 Variables de Entorno
**Acciones**:
- [ ] Crear archivos `.env.example` para frontend y backend
- [ ] Documentar todas las variables necesarias
- [ ] Configurar secrets en GitHub para CI/CD

---

### Fase 2: Mejoras Funcionales (Backlog P1)

#### 2.1 Filtro de CLUES por Estado
- [ ] Implementar filtrado de CLUES según estado del usuario en COORD_ESTATAL
- [ ] Agregar campo `estado` a perfil de usuario si no existe

#### 2.2 Paginación en Tablas
- [ ] Implementar paginación server-side para:
  - Lista de campañas
  - Lista de propuestas
  - Lista de validaciones
- [ ] Agregar componente de paginación reutilizable

#### 2.3 Edición de Propuestas
- [ ] Permitir editar propuestas antes de que inicie validación
- [ ] Implementar versionado de propuestas

---

### Fase 3: Mejoras UX/UI (Prioridad Media)

#### 3.1 Búsqueda y Filtros
- [ ] Agregar búsqueda en tablas principales
- [ ] Implementar filtros avanzados por:
  - Estado
  - Fecha
  - Posición
  - CLUES

#### 3.2 Notificaciones
- [ ] Implementar notificaciones in-app
- [ ] Configurar notificaciones por email (Supabase Edge Functions)

#### 3.3 Historial de Cambios
- [ ] Implementar audit log para campañas
- [ ] Mostrar historial de estados de propuestas

---

### Fase 4: Mejoras Avanzadas (Prioridad Baja)

#### 4.1 Reportes y Analytics
- [ ] Dashboard con gráficas interactivas (Recharts ya instalado)
- [ ] Exportación a Excel/PDF
- [ ] Reportes personalizables

#### 4.2 Modo Oscuro
- [ ] Implementar toggle de tema (next-themes ya instalado)
- [ ] Adaptar paleta de colores

#### 4.3 Optimización de Performance
- [ ] Implementar lazy loading de rutas
- [ ] Optimizar queries de Supabase
- [ ] Implementar caching con React Query o SWR

---

## 📊 Cronograma Sugerido

| Fase | Duración Estimada | Dependencias |
|------|-------------------|--------------|
| Fase 1 | 2-3 semanas | Accesos configurados |
| Fase 2 | 2 semanas | Fase 1 completada |
| Fase 3 | 2 semanas | Fase 2 completada |
| Fase 4 | 2-3 semanas | Fase 3 completada |

---

## 🔧 Deuda Técnica Identificada

1. **Console.logs de debug**: Múltiples console.log en AuthContext.js para debugging
2. **Manejo de errores**: Falta estandarización en manejo de errores
3. **Documentación de código**: Faltan comentarios y documentación inline
4. **Types/PropTypes**: No hay validación de props en componentes React
5. **Inconsistencia Backend/Frontend**: MongoDB en backend vs PostgreSQL en documentación

---

## 📝 Notas Adicionales

### Dependencias a Actualizar
- Revisar compatibilidad de React 19 con dependencias actuales
- Actualizar dependencias con vulnerabilidades conocidas

### Mejoras de Seguridad
- Implementar RLS (Row Level Security) policies en Supabase
- Revisar configuración de CORS
- Implementar rate limiting en API

---

## ✅ Próximos Pasos Inmediatos

1. Configurar accesos necesarios (ver `ACCESOS_NECESARIOS.md`)
2. Eliminar console.logs de debug en producción
3. Crear archivo `.env.example`
4. Definir decisión sobre unificación de backend
5. Comenzar con implementación de tests
