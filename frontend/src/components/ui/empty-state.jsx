import { cn } from '../../lib/utils';
import { Button } from './button';
import { 
  FileX, SearchX, Inbox, FolderOpen, Users, FileText, 
  Megaphone, AlertCircle, Plus, RefreshCw 
} from 'lucide-react';

/**
 * Preset icons for common empty states
 */
const PRESET_ICONS = {
  default: Inbox,
  search: SearchX,
  file: FileX,
  folder: FolderOpen,
  users: Users,
  documents: FileText,
  campaigns: Megaphone,
  error: AlertCircle,
};

/**
 * EmptyState component for displaying when there's no data to show
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.icon - Custom icon component
 * @param {string} props.iconPreset - Preset icon name (default, search, file, folder, users, documents, campaigns, error)
 * @param {string} props.actionLabel - Text for primary action button
 * @param {Function} props.onAction - Handler for primary action
 * @param {string} props.secondaryActionLabel - Text for secondary action
 * @param {Function} props.onSecondaryAction - Handler for secondary action
 * @param {string} props.size - Size variant (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <EmptyState 
 *   iconPreset="campaigns"
 *   title="No hay campañas"
 *   description="Crea tu primera campaña para comenzar"
 *   actionLabel="Nueva campaña"
 *   onAction={() => navigate('/campaigns/new')}
 * />
 */
export function EmptyState({
  title = 'Sin datos',
  description,
  icon: CustomIcon,
  iconPreset = 'default',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = 'md',
  className,
  children,
}) {
  const Icon = CustomIcon || PRESET_ICONS[iconPreset] || PRESET_ICONS.default;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        sizes.container,
        className
      )}
      data-testid="empty-state"
    >
      <div 
        className={cn(
          'bg-slate-100 rounded-full flex items-center justify-center mb-4',
          sizes.iconWrapper
        )}
      >
        <Icon 
          className={cn('text-slate-400', sizes.icon)} 
          strokeWidth={1.5} 
        />
      </div>
      
      <h3 
        className={cn(
          'font-heading font-semibold text-slate-900 mb-2',
          sizes.title
        )}
      >
        {title}
      </h3>
      
      {description && (
        <p 
          className={cn(
            'font-body text-slate-500 max-w-sm mb-6',
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline" 
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {secondaryActionLabel}
            </Button>
          )}
          
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Empty state specifically for search results
 */
export function SearchEmptyState({ 
  query, 
  onClear,
  className,
}) {
  return (
    <EmptyState
      iconPreset="search"
      title="Sin resultados"
      description={
        query 
          ? `No se encontraron resultados para "${query}"` 
          : 'No se encontraron resultados con los filtros aplicados'
      }
      secondaryActionLabel={onClear ? 'Limpiar búsqueda' : undefined}
      onSecondaryAction={onClear}
      className={className}
    />
  );
}

/**
 * Empty state for loading errors with retry
 */
export function ErrorEmptyState({ 
  message = 'Error al cargar los datos',
  onRetry,
  className,
}) {
  return (
    <EmptyState
      iconPreset="error"
      title="Error"
      description={message}
      secondaryActionLabel={onRetry ? 'Reintentar' : undefined}
      onSecondaryAction={onRetry}
      className={className}
    />
  );
}

export default EmptyState;
