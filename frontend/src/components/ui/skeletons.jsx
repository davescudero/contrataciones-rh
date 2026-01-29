import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';

/**
 * TableSkeleton component for loading states in tables
 * 
 * @param {Object} props
 * @param {number} props.rows - Number of skeleton rows
 * @param {number} props.columns - Number of columns
 * @param {boolean} props.showHeader - Whether to show header skeleton
 * 
 * @example
 * {loading ? <TableSkeleton rows={5} columns={4} /> : <DataTable ... />}
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-4 p-4 border-b bg-slate-50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      )}
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="flex items-center gap-4 p-4 border-b"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={cn(
                'h-4 flex-1',
                // Vary widths for more realistic look
                colIndex === 0 && 'max-w-[60px]',
                colIndex === columns - 1 && 'max-w-[80px]',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * CardSkeleton for loading card content
 * 
 * @example
 * {loading ? <CardSkeleton /> : <Card>...</Card>}
 */
export function CardSkeleton({ className, lines = 3 }) {
  return (
    <div className={cn('p-6 rounded-lg border bg-card', className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} 
          />
        ))}
      </div>
    </div>
  );
}

/**
 * StatCardSkeleton for dashboard stat cards
 */
export function StatCardSkeleton({ className }) {
  return (
    <div className={cn('p-6 rounded-lg border bg-card', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * ListSkeleton for list items
 */
export function ListSkeleton({ 
  items = 5, 
  showAvatar = false, 
  className 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * FormSkeleton for form loading states
 */
export function FormSkeleton({ fields = 4, className }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * PageSkeleton for full page loading
 */
export function PageSkeleton({ className }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

/**
 * DetailSkeleton for detail pages
 */
export function DetailSkeleton({ className }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Back button */}
      <Skeleton className="h-9 w-24" />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default TableSkeleton;
