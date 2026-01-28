import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Toaster } from './ui/sonner';
import { 
  LayoutDashboard, 
  ClipboardList,
  Eye,
  Megaphone,
  BarChart3,
  FileText,
  CheckCircle,
  LogOut,
  User,
  Menu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ROLES, ROLE_LABELS } from '../lib/constants';

const NAV_ITEMS = [
  {
    title: 'Inicio',
    href: '/',
    icon: LayoutDashboard,
    roles: [ROLES.PLANEACION, ROLES.ATENCION_SALUD, ROLES.RH, ROLES.COORD_ESTATAL, ROLES.VALIDADOR, ROLES.DG],
  },
  {
    title: 'Campañas',
    href: '/planeacion/campaigns',
    icon: ClipboardList,
    roles: [ROLES.PLANEACION],
  },
  {
    title: 'Revisión',
    href: '/atencion-salud/review',
    icon: Eye,
    roles: [ROLES.ATENCION_SALUD],
  },
  {
    title: 'Activación',
    href: '/rh/campaigns',
    icon: Megaphone,
    roles: [ROLES.RH],
  },
  {
    title: 'Dashboard RH',
    href: '/rh/dashboard',
    icon: BarChart3,
    roles: [ROLES.RH],
  },
  {
    title: 'Propuestas',
    href: '/coordinacion/proposals',
    icon: FileText,
    roles: [ROLES.COORD_ESTATAL],
  },
  {
    title: 'Validaciones',
    href: '/validador/validations',
    icon: CheckCircle,
    roles: [ROLES.VALIDADOR],
  },
  {
    title: 'Dashboard DG',
    href: '/dg/dashboard',
    icon: BarChart3,
    roles: [ROLES.DG],
  },
];

export const Layout = ({ children }) => {
  const { user, userRoles, signOut, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleNavItems = NAV_ITEMS.filter(item => hasAnyRole(item.roles));

  const handleSignOut = async () => {
    console.log('=== DEBUG: handleSignOut called');
    try {
      await signOut();
      console.log('=== DEBUG: signOut completed');
      navigate('/login');
    } catch (err) {
      console.error('=== DEBUG: signOut error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-heading font-semibold text-slate-900 hidden sm:block">
                Sistema de Reclutamiento
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" data-testid="main-nav">
              {visibleNavItems.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  data-testid={`nav-${item.href.replace(/\//g, '-').slice(1) || 'home'}`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Direct Logout Link - más confiable */}
              <a 
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  // Clear localStorage directly
                  localStorage.removeItem('sb-gnvyhxmbvzvqkjslqiur-auth-token');
                  // Force reload to login
                  window.location.href = '/login';
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer"
                data-testid="direct-logout-btn"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Salir
              </a>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Navegación</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {visibleNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2"
                    data-testid="user-menu-btn"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[150px] truncate">
                      {user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64" data-testid="user-menu-dropdown">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs text-slate-500">
                        {userRoles.length > 0 
                          ? userRoles.map(r => ROLE_LABELS[r] || r).join(', ')
                          : 'Sin roles'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
};
