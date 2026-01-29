import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * SearchInput component with debounce support
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Handler for value changes
 * @param {string} props.placeholder - Input placeholder
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 * @param {boolean} props.loading - Whether search is in progress
 * @param {boolean} props.showClear - Whether to show clear button
 * 
 * @example
 * const [search, setSearch] = useState('');
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Buscar campañas..."
 * />
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  loading = false,
  showClear = true,
  className,
  inputClassName,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || '');
  const debounceRef = useRef(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the onChange call
    if (debounceMs > 0) {
      debounceRef.current = setTimeout(() => {
        onChange?.(newValue);
      }, debounceMs);
    } else {
      onChange?.(newValue);
    }
  }, [onChange, debounceMs]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange?.('');
  }, [onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn('pl-9 pr-9', inputClassName)}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
        )}
        {showClear && localValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for search functionality
 * 
 * @example
 * const { query, setQuery, filteredData, isSearching } = useSearch({
 *   data: campaigns,
 *   searchFields: ['name', 'description'],
 * });
 */
export function useSearch({
  data = [],
  searchFields = [],
  initialQuery = '',
  debounceMs = 300,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  // Debounce query updates
  useEffect(() => {
    setIsSearching(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs]);

  // Filter data based on search query
  const filteredData = useCallback(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const searchTerms = debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return data.filter((item) => {
      // Check if all search terms match at least one field
      return searchTerms.every((term) => {
        return searchFields.some((field) => {
          const value = getNestedValue(item, field);
          return value && String(value).toLowerCase().includes(term);
        });
      });
    });
  }, [data, debouncedQuery, searchFields])();

  return {
    query,
    setQuery,
    filteredData,
    isSearching,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length,
    clear: () => setQuery(''),
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * SearchBar with filters - combines search input with filter buttons
 * 
 * @example
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   filters={[
 *     { label: 'Todos', value: 'all', count: 100 },
 *     { label: 'Activos', value: 'active', count: 50 },
 *   ]}
 *   activeFilter={filter}
 *   onFilterChange={setFilter}
 * />
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  filters = [],
  activeFilter,
  onFilterChange,
  loading = false,
  className,
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search */}
      <div className="flex-1">
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          loading={loading}
        />
      </div>

      {/* Filter buttons */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange?.(filter.value)}
              className="whitespace-nowrap"
            >
              {filter.label}
              {typeof filter.count === 'number' && (
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                  activeFilter === filter.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}>
                  {filter.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
