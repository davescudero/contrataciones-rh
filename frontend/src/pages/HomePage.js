import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Users, 
  FileText, 
  Building2, 
  ClipboardCheck, 
  LayoutDashboard,
  Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_LABELS = {
  admin: 'Administrador',
  hr_manager: 'Gestor de RH',
  validator: 'Validador',
  viewer: 'Visualizador',
  state_coordinator: 'Coordinador Estatal',
};

const MENU_ITEMS = [
  {
    title: 'Campañas',
    description: 'Gestión de campañas de reclutamiento',
    icon: Megaphone,
    href: '/campaigns',
    roles: ['admin', 'hr_manager', 'state_coordinator', 'viewer'],
  },
  {
    title: 'Propuestas',
    description: 'Visualizar y gestionar propuestas',
    icon: FileText,
    href: '/proposals',
    roles: ['admin', 'hr_manager', 'validator', 'state_coordinator', 'viewer'],
  },
  {
    title: 'Validaciones',
    description: 'Revisar y validar propuestas',
    icon: ClipboardCheck,
    href: '/validations',
    roles: ['admin', 'validator'],
  },
  {
    title: 'Unidades de Salud',
    description: 'Catálogo de unidades médicas',
    icon: Building2,
    href: '/health-facilities',
    roles: ['admin', 'hr_manager', 'state_coordinator'],
  },
  {
    title: 'Usuarios',
    description: 'Administración de usuarios del sistema',
    icon: Users,
    href: '/users',
    roles: ['admin'],
  },
];

export default function HomePage() {
  const { user, userRoles, hasAnyRole } = useAuth();

  const visibleMenuItems = MENU_ITEMS.filter(item => hasAnyRole(item.roles));

  return (
    <div className="space-y-8" data-testid="home-page">
      {/* Welcome Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900" data-testid="welcome-title">
              Bienvenido al Sistema
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

      {/* Menu Grid */}
      {visibleMenuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="menu-grid">
          {visibleMenuItems.map((item) => (
            <Link key={item.href} to={item.href} className="block">
              <Card 
                className="h-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
                data-testid={`menu-item-${item.href.replace('/', '')}`}
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
      ) : (
        <Card className="bg-amber-50 border-amber-200" data-testid="no-access-card">
          <CardContent className="p-6 text-center">
            <p className="font-body text-amber-800">
              No tienes acceso a ningún módulo. Contacta al administrador.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
