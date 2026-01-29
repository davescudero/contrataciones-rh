/**
 * UI Components Index
 * 
 * This file exports all custom UI components for easy importing.
 * 
 * Usage:
 * import { EmptyState, ConfirmDialog, StatusBadge } from '@/components/ui';
 */

// Empty States
export { EmptyState, SearchEmptyState, ErrorEmptyState } from './empty-state';

// Dialogs
export { ConfirmDialog, useConfirmDialog } from './confirm-dialog';

// Pagination
export { DataTablePagination, SimplePagination } from './data-table-pagination';

// Skeletons
export { 
  TableSkeleton, 
  CardSkeleton, 
  StatCardSkeleton, 
  ListSkeleton, 
  FormSkeleton, 
  PageSkeleton,
  DetailSkeleton,
} from './skeletons';

// Navigation
export { Breadcrumbs, PageHeader } from './breadcrumbs';

// Search
export { SearchInput, SearchBar, useSearch } from './search-input';

// Status
export { 
  StatusBadge, 
  CampaignStatusBadge, 
  ProposalStatusBadge, 
  ValidationStatusBadge,
  CAMPAIGN_STATUS_CONFIG,
  PROPOSAL_STATUS_CONFIG,
} from './status-badge';
