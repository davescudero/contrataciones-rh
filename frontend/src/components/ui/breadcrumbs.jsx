import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs component for navigation context
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items { label, href, icon? }
 * @param {boolean} props.showHome - Whether to show home icon as first item
 * @param {string} props.separator - Separator between items
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Campañas', href: '/planeacion/campaigns' },
 *     { label: 'Campaña 2025', href: '/planeacion/campaigns/123' },
 *     { label: 'Editar' },
 *   ]}
 * />
 */
export function Breadcrumbs({
  items = [],
  showHome = true,
  className,
}) {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if no items provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname);

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav 
      aria-label="Navegación"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {/* Home */}
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100"
              aria-label="Inicio"
            >
              <Home className="w-4 h-4" />
            </Link>
            {breadcrumbItems.length > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
            )}
          </li>
        )}

        {/* Items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {isLast ? (
                <span 
                  className="text-slate-900 font-medium flex items-center gap-1.5"
                  aria-current="page"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    to={item.href || '#'}
                    className="text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 hover:underline"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Route labels mapping for auto-generation
 */
const ROUTE_LABELS = {
  'planeacion': 'Planeación',
  'campaigns': 'Campañas',
  'atencion-salud': 'Atención a la Salud',
  'review': 'Revisión',
  'rh': 'Recursos Humanos',
  'dashboard': 'Dashboard',
  'coordinacion': 'Coordinación',
  'proposals': 'Propuestas',
  'validador': 'Validador',
  'validations': 'Validaciones',
  'dg': 'Dirección General',
  'new': 'Nueva',
  'edit': 'Editar',
};

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip UUID-like segments in label but include in path
    const isId = /^[0-9a-f-]{36}$/i.test(segment) || /^\d+$/.test(segment);
    
    if (isId) {
      // For IDs, we'll update the previous item's href and skip adding new item
      // Or add a generic "Detalle" label
      breadcrumbs.push({
        label: 'Detalle',
        href: currentPath,
      });
    } else {
      breadcrumbs.push({
        label: ROUTE_LABELS[segment] || capitalize(segment),
        href: currentPath,
      });
    }
  }

  // Remove href from last item (current page)
  if (breadcrumbs.length > 0) {
    delete breadcrumbs[breadcrumbs.length - 1].href;
  }

  return breadcrumbs;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

/**
 * PageHeader component that combines title, description, and breadcrumbs
 * 
 * @example
 * <PageHeader
 *   title="Nueva Campaña"
 *   description="Configura los detalles de la nueva campaña"
 *   breadcrumbs={[
 *     { label: 'Campañas', href: '/planeacion/campaigns' },
 *     { label: 'Nueva' },
 *   ]}
 *   actions={<Button>Guardar</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
  className,
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              {title}
            </h1>
            {description && (
              <p className="font-body text-sm text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default Breadcrumbs;
