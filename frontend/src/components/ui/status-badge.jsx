import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  FileText, Pause, Play, Send, Eye
} from 'lucide-react';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        outline: 'bg-transparent border border-slate-300 text-slate-600',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/**
 * Preset icons for common statuses
 */
const STATUS_ICONS = {
  approved: CheckCircle,
  success: CheckCircle,
  active: Play,
  rejected: XCircle,
  error: XCircle,
  pending: Clock,
  warning: AlertCircle,
  draft: FileText,
  inactive: Pause,
  submitted: Send,
  review: Eye,
  in_validation: Eye,
};

/**
 * StatusBadge component for displaying status indicators
 * 
 * @param {Object} props
 * @param {string} props.status - Status key
 * @param {string} props.label - Display label (optional, uses status if not provided)
 * @param {string} props.variant - Color variant
 * @param {string} props.size - Size variant
 * @param {boolean} props.showIcon - Whether to show status icon
 * @param {React.ReactNode} props.icon - Custom icon component
 * 
 * @example
 * <StatusBadge status="approved" label="Aprobado" variant="success" showIcon />
 */
export function StatusBadge({
  status,
  label,
  variant = 'default',
  size = 'md',
  showIcon = false,
  icon: CustomIcon,
  className,
}) {
  const Icon = CustomIcon || STATUS_ICONS[status?.toLowerCase()];
  const displayLabel = label || status;

  return (
    <span className={cn(statusBadgeVariants({ variant, size }), className)}>
      {showIcon && Icon && (
        <Icon className={cn(
          'flex-shrink-0',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-3.5 h-3.5',
          size === 'lg' && 'w-4 h-4',
        )} />
      )}
      {displayLabel}
    </span>
  );
}

/**
 * Campaign status configuration
 */
export const CAMPAIGN_STATUS_CONFIG = {
  DRAFT: { label: 'Borrador', variant: 'default', icon: 'draft' },
  UNDER_REVIEW: { label: 'En Revisión', variant: 'warning', icon: 'review' },
  APPROVED: { label: 'Aprobada', variant: 'info', icon: 'approved' },
  ACTIVE: { label: 'Activa', variant: 'success', icon: 'active' },
  INACTIVE: { label: 'Inactiva', variant: 'outline', icon: 'inactive' },
};

/**
 * Proposal status configuration
 */
export const PROPOSAL_STATUS_CONFIG = {
  SUBMITTED: { label: 'Enviada', variant: 'default', icon: 'submitted' },
  IN_VALIDATION: { label: 'En Validación', variant: 'warning', icon: 'in_validation' },
  APPROVED: { label: 'Aprobada', variant: 'success', icon: 'approved' },
  REJECTED: { label: 'Rechazada', variant: 'error', icon: 'rejected' },
};

/**
 * CampaignStatusBadge - Preset badge for campaign statuses
 * 
 * @example
 * <CampaignStatusBadge status="ACTIVE" showIcon />
 */
export function CampaignStatusBadge({ status, showIcon = false, size = 'md', className }) {
  const config = CAMPAIGN_STATUS_CONFIG[status] || { label: status, variant: 'default' };
  
  return (
    <StatusBadge
      status={config.icon || status}
      label={config.label}
      variant={config.variant}
      size={size}
      showIcon={showIcon}
      className={className}
    />
  );
}

/**
 * ProposalStatusBadge - Preset badge for proposal statuses
 * 
 * @example
 * <ProposalStatusBadge status="APPROVED" showIcon />
 */
export function ProposalStatusBadge({ status, showIcon = false, size = 'md', className }) {
  const config = PROPOSAL_STATUS_CONFIG[status] || { label: status, variant: 'default' };
  
  return (
    <StatusBadge
      status={config.icon || status}
      label={config.label}
      variant={config.variant}
      size={size}
      showIcon={showIcon}
      className={className}
    />
  );
}

/**
 * ValidationStatusBadge - For validation statuses
 */
export function ValidationStatusBadge({ status, showIcon = false, size = 'md', className }) {
  const configs = {
    PENDING: { label: 'Pendiente', variant: 'warning', icon: 'pending' },
    APPROVED: { label: 'Aprobada', variant: 'success', icon: 'approved' },
    REJECTED: { label: 'Rechazada', variant: 'error', icon: 'rejected' },
  };
  
  const config = configs[status] || { label: status, variant: 'default' };
  
  return (
    <StatusBadge
      status={config.icon || status}
      label={config.label}
      variant={config.variant}
      size={size}
      showIcon={showIcon}
      className={className}
    />
  );
}

export default StatusBadge;
