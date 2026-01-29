# Sistema de Reclutamiento - Contrataciones RH

Sistema web para la gestión de campañas de reclutamiento con múltiples roles de usuario.

## Estructura del Proyecto

```
contrataciones_rh/
├── backend/           # API con FastAPI (Python)
├── frontend/          # Aplicación React
├── memory/            # Documentación del proyecto (PRD)
├── ACCESOS_NECESARIOS.md
├── PLAN_DE_MEJORA.md
└── design_guidelines.json
```

## Tecnologías

- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth

## Roles del Sistema

- Planeación
- Recursos Humanos (RH)
- Atención a la Salud
- Coordinación Estatal
- Validador
- Dirección General (DG)

## Desarrollo

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## Testing

```bash
cd frontend
npm test
```