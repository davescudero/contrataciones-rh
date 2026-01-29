import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupabaseQuery, useSupabaseMutation, usePaginatedQuery } from './useSupabaseQuery';

// Mock supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock logger
jest.mock('../lib/logger', () => ({
  error: jest.fn(),
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('useSupabaseQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const mockQuery = jest.fn().mockResolvedValue({ data: [], error: null });
    
    const { result } = renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test' })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should fetch data successfully', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const mockQuery = jest.fn().mockResolvedValue({ data: mockData, error: null });
    
    const { result } = renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Database error');
    const mockQuery = jest.fn().mockResolvedValue({ data: null, error: mockError });
    
    const { result } = renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
  });

  it('should not fetch when disabled', () => {
    const mockQuery = jest.fn().mockResolvedValue({ data: [], error: null });
    
    renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test', enabled: false })
    );

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback', async () => {
    const mockData = [{ id: 1 }];
    const mockQuery = jest.fn().mockResolvedValue({ data: mockData, error: null });
    const onSuccess = jest.fn();
    
    renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test', onSuccess })
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should refetch data', async () => {
    const mockData1 = [{ id: 1 }];
    const mockData2 = [{ id: 1 }, { id: 2 }];
    const mockQuery = jest.fn()
      .mockResolvedValueOnce({ data: mockData1, error: null })
      .mockResolvedValueOnce({ data: mockData2, error: null });
    
    const { result } = renderHook(() => 
      useSupabaseQuery(mockQuery, { context: 'Test' })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });
  });
});

describe('useSupabaseMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mutate data successfully', async () => {
    const mockResult = { id: 1, name: 'Created' };
    const mockMutation = jest.fn().mockResolvedValue({ data: mockResult, error: null });
    
    const { result } = renderHook(() => 
      useSupabaseMutation(mockMutation, { context: 'Test' })
    );

    let response;
    await act(async () => {
      response = await result.current.mutate({ name: 'New Item' });
    });

    expect(response.data).toEqual(mockResult);
    expect(response.error).toBe(null);
    expect(result.current.data).toEqual(mockResult);
  });

  it('should handle mutation errors', async () => {
    const mockError = new Error('Insert failed');
    const mockMutation = jest.fn().mockResolvedValue({ data: null, error: mockError });
    
    const { result } = renderHook(() => 
      useSupabaseMutation(mockMutation, { context: 'Test' })
    );

    let response;
    await act(async () => {
      response = await result.current.mutate({ name: 'New Item' });
    });

    expect(response.error).toBe(mockError);
    expect(result.current.error).toBe(mockError);
  });

  it('should call onSuccess callback', async () => {
    const mockResult = { id: 1 };
    const mockMutation = jest.fn().mockResolvedValue({ data: mockResult, error: null });
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => 
      useSupabaseMutation(mockMutation, { context: 'Test', onSuccess })
    );

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockResult, { name: 'Test' });
  });

  it('should reset state', async () => {
    const mockResult = { id: 1 };
    const mockMutation = jest.fn().mockResolvedValue({ data: mockResult, error: null });
    
    const { result } = renderHook(() => 
      useSupabaseMutation(mockMutation, { context: 'Test' })
    );

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(result.current.data).toEqual(mockResult);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });
});

describe('usePaginatedQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch paginated data', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const mockQuery = jest.fn().mockResolvedValue({ 
      data: mockData, 
      count: 50, 
      error: null 
    });
    
    const { result } = renderHook(() => 
      usePaginatedQuery(mockQuery, { context: 'Test', pageSize: 10 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.page).toBe(0);
  });

  it('should navigate pages', async () => {
    const mockQuery = jest.fn().mockResolvedValue({ 
      data: [], 
      count: 50, 
      error: null 
    });
    
    const { result } = renderHook(() => 
      usePaginatedQuery(mockQuery, { context: 'Test', pageSize: 10 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });

    expect(result.current.hasPrevPage).toBe(true);
  });
});
