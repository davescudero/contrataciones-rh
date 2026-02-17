import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  ClipboardList, 
  Eye,
  FileText, 
  CheckCircle,
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
    <div className="space-y-6" data-testid="home-page">
      {/* Welcome + Roles compact bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg px-5 py-4 border" style={{ backgroundColor: '#fdf8f4', borderColor: '#B38E5D40' }}>
        <div>
          <h1 className="font-heading text-lg font-semibold text-gray-900" data-testid="welcome-title">
            Bienvenido, <span style={{ color: '#691C32' }}>{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRoles.length > 0 ? (
            userRoles.map(role => (
              <span 
                key={role}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: '#691C32' }}
                data-testid="user-roles"
              >
                {ROLE_LABELS[role] || role}
              </span>
            ))
          ) : (
            <span className="text-sm text-amber-600 font-medium" data-testid="no-roles">Sin roles asignados</span>
          )}
        </div>
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
                className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                style={{ borderTopWidth: '3px', borderTopColor: '#691C32' }}
                data-testid={`menu-item-${item.href.replace(/\//g, '-').slice(1)}`}
              >
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: '#691C3215' }}>
                    <item.icon className="w-5 h-5" style={{ color: '#691C32' }} strokeWidth={1.5} />
                  </div>
                  <CardTitle className="font-heading text-lg font-semibold text-gray-900">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body text-sm text-gray-500">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : userRoles.length > 0 && (
        <Card className="bg-gray-50 border-gray-200" data-testid="no-access-card">
          <CardContent className="p-6 text-center">
            <p className="font-body text-gray-600">
              No hay módulos disponibles para tus roles actuales.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
