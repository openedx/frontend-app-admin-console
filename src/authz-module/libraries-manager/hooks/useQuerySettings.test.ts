import { renderHook, act } from '@testing-library/react';
import { QuerySettings } from '@src/authz-module/data/api';
import { useQuerySettings } from './useQuerySettings';

describe('useQuerySettings', () => {
  const defaultQuerySettings: QuerySettings = {
    roles: null,
    search: null,
    pageSize: 10,
    pageIndex: 0,
    ordering: null,
  };

  it('should initialize with default query settings when no initial settings provided', () => {
    const { result } = renderHook(() => useQuerySettings());

    expect(result.current.querySettings).toEqual(defaultQuerySettings);
    expect(typeof result.current.handleTableFetch).toBe('function');
  });

  it('should initialize with custom initial query settings', () => {
    const customInitialSettings: QuerySettings = {
      roles: 'admin,editor',
      search: 'test-user',
      pageSize: 20,
      pageIndex: 2,
      ordering: 'username',
    };

    const { result } = renderHook(() => useQuerySettings(customInitialSettings));

    expect(result.current.querySettings).toEqual(customInitialSettings);
  });

  it('should update query settings when handleTableFetch is called with new filters', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 15,
      pageIndex: 1,
      sortBy: [{ id: 'username', desc: false }],
      filters: [
        { id: 'roles', value: ['admin', 'editor'] },
        { id: 'username', value: 'john' },
      ],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings).toEqual({
      roles: 'admin,editor',
      search: 'john',
      pageSize: 15,
      pageIndex: 1,
      ordering: 'username',
    });
  });

  it('should handle descending sort order by adding minus prefix', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [{ id: 'email', desc: true }],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.ordering).toBe('-email');
  });

  it('should convert camelCase sort field to snake_case', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [{ id: 'firstName', desc: false }],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.ordering).toBe('first_name');
  });

  it('should convert camelCase sort field to snake_case with descending order', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [{ id: 'lastName', desc: true }],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.ordering).toBe('-last_name');
  });

  it('should handle empty filters by setting values to null', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings).toEqual({
      roles: null,
      search: null,
      pageSize: 10,
      pageIndex: 0,
      ordering: null,
    });
  });

  it('should handle empty roles filter array by setting roles to null', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [],
      filters: [
        { id: 'roles', value: [] },
        { id: 'username', value: '' },
      ],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings).toEqual({
      roles: null,
      search: null,
      pageSize: 10,
      pageIndex: 0,
      ordering: null,
    });
  });

  it('should handle missing filters by setting default values', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [],
      filters: [
        { id: 'roles', value: undefined },
        { id: 'username', value: undefined },
      ],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings).toEqual({
      roles: null,
      search: null,
      pageSize: 10,
      pageIndex: 0,
      ordering: null,
    });
  });

  it('should use default pagination values when not provided', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      sortBy: [],
      filters: [],
    } as any; // Missing pageSize and pageIndex

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.pageSize).toBe(10);
    expect(result.current.querySettings.pageIndex).toBe(0);
  });

  it('should not update state if settings have not changed', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [],
      filters: [],
    };

    const initialSettings = result.current.querySettings;

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    // Should be the same object reference since no changes occurred
    expect(result.current.querySettings).toBe(initialSettings);
  });

  it('should update state when settings have changed', () => {
    const { result } = renderHook(() => useQuerySettings());

    const initialSettings = result.current.querySettings;

    const tableFilters = {
      pageSize: 20, // Different from default
      pageIndex: 0,
      sortBy: [],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    // Should be a different object reference since pageSize changed
    expect(result.current.querySettings).not.toBe(initialSettings);
    expect(result.current.querySettings.pageSize).toBe(20);
  });

  it('should handle complex filter combinations', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 25,
      pageIndex: 3,
      sortBy: [{ id: 'userRole', desc: true }],
      filters: [
        { id: 'roles', value: ['admin', 'editor', 'viewer'] },
        { id: 'username', value: 'test@example.com' },
        { id: 'otherFilter', value: 'ignored' }, // Should be ignored
      ],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings).toEqual({
      roles: 'admin,editor,viewer',
      search: 'test@example.com',
      pageSize: 25,
      pageIndex: 3,
      ordering: '-user_role',
    });
  });

  it('should handle multiple camelCase words in sort field', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [{ id: 'userFirstLastName', desc: false }],
      filters: [],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.ordering).toBe('user_first_last_name');
  });

  it('should preserve handleTableFetch function reference across renders', () => {
    const { result, rerender } = renderHook(() => useQuerySettings());

    const initialHandleTableFetch = result.current.handleTableFetch;

    rerender();

    expect(result.current.handleTableFetch).toBe(initialHandleTableFetch);
  });

  it('should handle whitespace-only search values as provided', () => {
    const { result } = renderHook(() => useQuerySettings());

    const tableFilters = {
      pageSize: 10,
      pageIndex: 0,
      sortBy: [],
      filters: [
        { id: 'username', value: '   ' }, // Whitespace only
      ],
    };

    act(() => {
      result.current.handleTableFetch(tableFilters);
    });

    expect(result.current.querySettings.search).toBe('   ');
  });

  it('should detect changes in roles filter', () => {
    const { result } = renderHook(() => useQuerySettings());

    // First set some roles
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [],
        filters: [{ id: 'roles', value: ['admin'] }],
      });
    });

    const settingsAfterFirstUpdate = result.current.querySettings;

    // Then change roles
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [],
        filters: [{ id: 'roles', value: ['editor'] }],
      });
    });

    expect(result.current.querySettings).not.toBe(settingsAfterFirstUpdate);
    expect(result.current.querySettings.roles).toBe('editor');
  });

  it('should detect changes in search filter', () => {
    const { result } = renderHook(() => useQuerySettings());

    // First set a search term
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [],
        filters: [{ id: 'username', value: 'john' }],
      });
    });

    const settingsAfterFirstUpdate = result.current.querySettings;

    // Then change search term
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [],
        filters: [{ id: 'username', value: 'jane' }],
      });
    });

    expect(result.current.querySettings).not.toBe(settingsAfterFirstUpdate);
    expect(result.current.querySettings.search).toBe('jane');
  });

  it('should detect changes in ordering', () => {
    const { result } = renderHook(() => useQuerySettings());

    // First set ordering
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [{ id: 'username', desc: false }],
        filters: [],
      });
    });

    const settingsAfterFirstUpdate = result.current.querySettings;

    // Then change ordering
    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 0,
        sortBy: [{ id: 'email', desc: true }],
        filters: [],
      });
    });

    expect(result.current.querySettings).not.toBe(settingsAfterFirstUpdate);
    expect(result.current.querySettings.ordering).toBe('-email');
  });

  it('should detect changes in pageSize', () => {
    const { result } = renderHook(() => useQuerySettings());

    const initialSettings = result.current.querySettings;

    act(() => {
      result.current.handleTableFetch({
        pageSize: 50,
        pageIndex: 0,
        sortBy: [],
        filters: [],
      });
    });

    expect(result.current.querySettings).not.toBe(initialSettings);
    expect(result.current.querySettings.pageSize).toBe(50);
  });

  it('should detect changes in pageIndex', () => {
    const { result } = renderHook(() => useQuerySettings());

    const initialSettings = result.current.querySettings;

    act(() => {
      result.current.handleTableFetch({
        pageSize: 10,
        pageIndex: 5,
        sortBy: [],
        filters: [],
      });
    });

    expect(result.current.querySettings).not.toBe(initialSettings);
    expect(result.current.querySettings.pageIndex).toBe(5);
  });
});
