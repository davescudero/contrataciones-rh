import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../lib/logger';

/**
 * Custom hook for Supabase queries with loading, error, and refetch capabilities
 * 
 * @param {Function} queryFn - Function that returns a Supabase query builder
 * @param {Object} options - Configuration options
 * @param {string} options.context - Context name for logging
 * @param {boolean} options.enabled - Whether to run the query (default: true)
 * @param {Array} options.deps - Dependencies array for re-running the query
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @param {any} options.initialData - Initial data value
 * @param {boolean} options.refetchOnMount - Whether to refetch on mount (default: true)
 * 
 * @example
 * const { data, loading, error, refetch } = useSupabaseQuery(
 *   () => supabase.from('campaigns').select('*').eq('status', 'ACTIVE'),
 *   { context: 'CampaignsPage', deps: [status] }
 * );
 */
export function useSupabaseQuery(queryFn, options = {}) {
  const {
    context = 'Query',
    enabled = true,
    deps = [],
    onSuccess,
    onError,
    initialData = null,
    refetchOnMount = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled && refetchOnMount);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return;

    const fetchId = ++fetchIdRef.current;
    
    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await queryFn();

      // Ignore results from stale fetches
      if (fetchId !== fetchIdRef.current || !mountedRef.current) return;

      if (result.error) {
        throw result.error;
      }

      setData(result.data);
      
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current || !mountedRef.current) return;

      logger.error(context, 'Query error', err);
      setError(err);
      
      if (onError) {
        onError(err);
      }
    } finally {
      if (fetchId === fetchIdRef.current && mountedRef.current) {
        setLoading(false);
        setIsRefetching(false);
      }
    }
  }, [queryFn, enabled, context, onSuccess, onError]);

  // Initial fetch and refetch on deps change
  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching,
    setData,
  };
}

/**
 * Hook for Supabase mutations (insert, update, delete)
 * 
 * @param {Function} mutationFn - Function that performs the mutation
 * @param {Object} options - Configuration options
 * 
 * @example
 * const { mutate, loading } = useSupabaseMutation(
 *   (data) => supabase.from('campaigns').insert(data),
 *   { 
 *     context: 'CreateCampaign',
 *     onSuccess: (data) => navigate(`/campaigns/${data.id}`)
 *   }
 * );
 */
export function useSupabaseMutation(mutationFn, options = {}) {
  const {
    context = 'Mutation',
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (variables) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);

      if (result.error) {
        throw result.error;
      }

      setData(result.data);
      
      if (onSuccess) {
        onSuccess(result.data, variables);
      }

      return { data: result.data, error: null };
    } catch (err) {
      logger.error(context, 'Mutation error', err);
      setError(err);
      
      if (onError) {
        onError(err, variables);
      }

      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [mutationFn, context, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for paginated Supabase queries
 * 
 * @param {Function} queryFn - Function that returns a Supabase query builder (receives page, pageSize)
 * @param {Object} options - Configuration options
 * 
 * @example
 * const { data, page, pageSize, totalPages, goToPage, nextPage, prevPage } = usePaginatedQuery(
 *   (page, pageSize) => supabase
 *     .from('proposals')
 *     .select('*', { count: 'exact' })
 *     .range(page * pageSize, (page + 1) * pageSize - 1),
 *   { context: 'Proposals', pageSize: 10 }
 * );
 */
export function usePaginatedQuery(queryFn, options = {}) {
  const {
    context = 'PaginatedQuery',
    pageSize: initialPageSize = 10,
    enabled = true,
    deps = [],
    onSuccess,
    onError,
  } = options;

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchPage = useCallback(async (targetPage = page) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn(targetPage, pageSize);

      if (result.error) {
        throw result.error;
      }

      setData(result.data || []);
      setTotalCount(result.count || 0);
      
      if (onSuccess) {
        onSuccess(result.data, result.count);
      }
    } catch (err) {
      logger.error(context, 'Paginated query error', err);
      setError(err);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, page, pageSize, queryFn, context, onSuccess, onError]);

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, enabled, ...deps]);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages - 1) {
      setPage(p => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 0) {
      setPage(p => p - 1);
    }
  }, [page]);

  const refetch = useCallback(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    refetch,
    hasNextPage: page < totalPages - 1,
    hasPrevPage: page > 0,
  };
}

export default useSupabaseQuery;
