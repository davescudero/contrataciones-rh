import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * DataTablePagination component for table pagination controls
 * 
 * @param {Object} props
 * @param {number} props.page - Current page (0-indexed)
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalCount - Total number of items
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Handler for page changes
 * @param {Function} props.onPageSizeChange - Handler for page size changes
 * @param {Array<number>} props.pageSizeOptions - Available page size options
 * @param {boolean} props.showPageSizeSelector - Whether to show page size selector
 * @param {boolean} props.showRowCount - Whether to show row count info
 * 
 * @example
 * <DataTablePagination
 *   page={page}
 *   pageSize={pageSize}
 *   totalCount={totalCount}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeSelector = true,
  showRowCount = true,
  className,
}) {
  const startRow = page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalCount);

  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className={cn(
      'flex items-center justify-between px-2 py-4',
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Filas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                onPageSizeChange?.(Number(value));
                // Reset to first page when changing page size
                onPageChange?.(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Row count info */}
        {showRowCount && (
          <div className="text-sm text-slate-500">
            {totalCount === 0 ? (
              'Sin resultados'
            ) : (
              <>
                Mostrando {startRow}-{endRow} de {totalCount}
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(0)}
            disabled={!canGoPrevious}
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(page - 1)}
            disabled={!canGoPrevious}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Page indicator */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm text-slate-700">
            Página {page + 1} de {totalPages || 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Next page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(page + 1)}
            disabled={!canGoNext}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(totalPages - 1)}
            disabled={!canGoNext}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple pagination with just previous/next
 */
export function SimplePagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(page - 1)}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>
      
      <span className="text-sm text-slate-600">
        {page + 1} / {totalPages || 1}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(page + 1)}
        disabled={!canGoNext}
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

export default DataTablePagination;
