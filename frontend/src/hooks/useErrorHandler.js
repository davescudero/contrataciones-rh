import { useCallback } from 'react';
import { toast } from 'sonner';
import logger from '../lib/logger';

/**
 * Custom hook for consistent error handling across the application
 * 
 * Usage:
 * const { handleError, handleAsyncOperation } = useErrorHandler('ComponentName');
 * 
 * // Option 1: Manual error handling
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(err, 'operación fallida');
 * }
 * 
 * // Option 2: Wrapped async operation
 * const result = await handleAsyncOperation(
 *   () => supabase.from('table').select(),
 *   'cargando datos'
 * );
 */
export function useErrorHandler(context) {
  /**
   * Handle an error with logging and user notification
   */
  const handleError = useCallback((error, userMessage, options = {}) => {
    const { 
      showToast = true, 
      toastType = 'error',
      logLevel = 'error' 
    } = options;

    // Log the error
    logger.apiError(context, userMessage, error);

    // Show user-friendly message
    if (showToast) {
      const displayMessage = userMessage || 'Ha ocurrido un error';
      
      switch (toastType) {
        case 'warning':
          toast.warning(displayMessage);
          break;
        case 'info':
          toast.info(displayMessage);
          break;
        default:
          toast.error(displayMessage);
      }
    }

    return null;
  }, [context]);

  /**
   * Wrap an async operation with error handling
   * Returns the data on success, null on error
   */
  const handleAsyncOperation = useCallback(async (
    operation, 
    operationName,
    options = {}
  ) => {
    const {
      showToast = true,
      successMessage = null,
      errorMessage = null,
      onSuccess = null,
      onError = null,
    } = options;

    try {
      const result = await operation();
      
      // Handle Supabase response format
      if (result?.error) {
        throw result.error;
      }

      // Show success toast if provided
      if (successMessage && showToast) {
        toast.success(successMessage);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result?.data || result);
      }

      return result?.data || result;
    } catch (error) {
      const message = errorMessage || `Error al ${operationName}`;
      handleError(error, message, { showToast });

      // Call error callback
      if (onError) {
        onError(error);
      }

      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncOperation,
  };
}

export default useErrorHandler;
