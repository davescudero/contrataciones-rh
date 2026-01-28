import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  ClipboardList, 
  Eye,
  UserCheck,
  FileText, 
  CheckCircle,
  LayoutDashboard,
  Megaphone,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROLES, ROLE_LABELS } from '../lib/constants';

const MENU_ITEMS = [
  {
    title: 'Gestión de Campañas',
    description: 'Crear y configurar campañas de reclutamiento',
    icon: ClipboardList,
    href: '/planeacion/campaigns',
    roles: [ROLES.PLANEACION],
  },
  {
    title: 'Revisión de Programas',
    description: 'Revisar y aprobar campañas en revisión',
    icon: Eye,
    href: '/atencion-salud/review',
    roles: [ROLES.ATENCION_SALUD],
  },
  {
    title: 'Activación de Campañas',
    description: 'Activar y desactivar campañas aprobadas',
    icon: Megaphone,
    href: '/rh/campaigns',
    roles: [ROLES.RH],
  },
  {
    title: 'Dashboard RH',
    description: 'Indicadores y reportes de reclutamiento',
    icon: BarChart3,
    href: '/rh/dashboard',
    roles: [ROLES.RH],
  },
  {
    title: 'Propuestas',
    description: 'Crear y dar seguimiento a propuestas',
    icon: FileText,
    href: '/coordinacion/proposals',
    roles: [ROLES.COORD_ESTATAL],
  },
  {
    title: 'Validaciones',
    description: 'Validar propuestas asignadas',
    icon: CheckCircle,
    href: '/validador/validations',
    roles: [ROLES.VALIDADOR],
  },
  {
    title: 'Dashboard Ejecutivo',
    description: 'Vista ejecutiva del proceso de reclutamiento',
    icon: BarChart3,
    href: '/dg/dashboard',
    roles: [ROLES.DG],
  },
];

export default function HomePage() {
  const { user, userRoles, hasAnyRole } = useAuth();

  const visibleMenuItems = MENU_ITEMS.filter(item => hasAnyRole(item.roles));

  return (
    <div className="space-y-8" data-testid="home-page">
      {/* Debug Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 font-mono text-xs" data-testid="debug-info">
        <p><strong>DEBUG - User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>DEBUG - Email:</strong> {user?.email || 'N/A'}</p>
      </div>

      {/* Welcome Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900" data-testid="welcome-title">
              Sistema de Reclutamiento
            </h1>
            <p className="font-body text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="font-body text-sm text-slate-600">
          <span className="font-medium">Roles asignados: </span>
          {userRoles.length > 0 ? (
            <span className="text-slate-900" data-testid="user-roles">
              {userRoles.map(role => ROLE_LABELS[role] || role).join(', ')}
            </span>
          ) : (
            <span className="text-amber-600" data-testid="no-roles">Sin roles asignados</span>
          )}
        </p>
      </div>

      {/* No Roles Warning */}
      {userRoles.length === 0 && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200" data-testid="no-roles-alert">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Sin acceso al sistema</AlertTitle>
          <AlertDescription className="text-amber-700">
            Tu usuario no tiene roles asignados. Contacta a administración para solicitar acceso.
          </AlertDescription>
        </Alert>
      )}

      {/* Menu Grid */}
      {visibleMenuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="menu-grid">
          {visibleMenuItems.map((item) => (
            <Link key={item.href} to={item.href} className="block">
              <Card 
                className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
                data-testid={`menu-item-${item.href.replace(/\//g, '-').slice(1)}`}
              >
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                    <item.icon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="font-heading text-lg font-semibold text-slate-900">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body text-sm text-slate-500">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : userRoles.length > 0 && (
        <Card className="bg-slate-50 border-slate-200" data-testid="no-access-card">
          <CardContent className="p-6 text-center">
            <p className="font-body text-slate-600">
              No hay módulos disponibles para tus roles actuales.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
