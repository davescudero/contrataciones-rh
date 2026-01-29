import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { cn } from '../../lib/utils';
import { AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

/**
 * ConfirmDialog component for confirmation modals
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Handler for open state changes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {string} props.confirmLabel - Label for confirm button
 * @param {string} props.cancelLabel - Label for cancel button
 * @param {Function} props.onConfirm - Handler for confirm action
 * @param {Function} props.onCancel - Handler for cancel action
 * @param {string} props.variant - Variant (danger, warning, info, success)
 * @param {boolean} props.loading - Whether the action is loading
 * 
 * @example
 * <ConfirmDialog
 *   open={showDeleteDialog}
 *   onOpenChange={setShowDeleteDialog}
 *   title="Eliminar campaña"
 *   description="¿Estás seguro de eliminar esta campaña? Esta acción no se puede deshacer."
 *   variant="danger"
 *   confirmLabel="Eliminar"
 *   onConfirm={handleDelete}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
  children,
}) {
  const variants = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-600',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-600',
    },
  };

  const config = variants[variant] || variants.danger;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              config.iconBg
            )}>
              <Icon className={cn('w-5 h-5', config.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="font-heading text-lg">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-body mt-2">
                {description}
              </AlertDialogDescription>
              {children}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(config.buttonClass)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4\" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" cy="12" r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Procesando...
              </span>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing confirm dialog state
 * 
 * @example
 * const { dialogProps, confirm } = useConfirmDialog({
 *   title: 'Eliminar',
 *   description: '¿Estás seguro?',
 *   onConfirm: async (data) => { await deleteItem(data.id) }
 * });
 * 
 * // Usage
 * <Button onClick={() => confirm({ id: item.id })}>Eliminar</Button>
 * <ConfirmDialog {...dialogProps} />
 */
export function useConfirmDialog(options = {}) {
  const { useState, useCallback } = require('react');
  
  const [open, setOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((data = null) => {
    setPendingData(data);
    setOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (options.onConfirm) {
      setLoading(true);
      try {
        await options.onConfirm(pendingData);
        setOpen(false);
        setPendingData(null);
      } finally {
        setLoading(false);
      }
    }
  }, [options, pendingData]);

  const handleCancel = useCallback(() => {
    setPendingData(null);
    if (options.onCancel) {
      options.onCancel();
    }
  }, [options]);

  return {
    dialogProps: {
      open,
      onOpenChange: setOpen,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      variant: options.variant,
      loading,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    confirm,
    pendingData,
    isOpen: open,
    close: () => setOpen(false),
  };
}

export default ConfirmDialog;
