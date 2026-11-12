import { act, renderHook } from '@testing-library/react';
import { SCOPE_TYPES, TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import { useRolesQuerySettings, type RolesTableState } from './useRolesQuerySettings';

const ALL_SCOPE_TYPES = [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY];

const tableState = (overrides: RolesTableState = {}): RolesTableState => ({
  pageSize: TABLE_DEFAULT_PAGE_SIZE, pageIndex: 0, sortBy: [], filters: [], ...overrides,
});

const renderSettings = (viewableScopeTypes: string[] = ALL_SCOPE_TYPES) => renderHook(
  (props: { viewable: string[] }) => useRolesQuerySettings(props.viewable),
  { initialProps: { viewable: viewableScopeTypes } },
);

describe('useRolesQuerySettings', () => {
  it('starts on the first page of every viewable scope type, with the endpoint default sort', () => {
    const { result } = renderSettings();

    expect(result.current.querySettings).toEqual({
      scopeTypes: ALL_SCOPE_TYPES,
      search: null,
      sortBy: null,
      order: null,
      pageIndex: 0,
      pageSize: TABLE_DEFAULT_PAGE_SIZE,
    });
  });

  it.each([
    ['name', 'display_name'],
    ['resourceType', 'scope_type'],
    ['members', 'user_count'],
    ['lastUpdated', 'updated_at'],
  ])('sorts the %s column by %s, in both orders', (columnId, sortBy) => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({ sortBy: [{ id: columnId, desc: false }] })));
    expect(result.current.querySettings).toMatchObject({ sortBy, order: 'asc' });

    act(() => result.current.handleTableFetch(tableState({ sortBy: [{ id: columnId, desc: true }] })));
    expect(result.current.querySettings).toMatchObject({ sortBy, order: 'desc' });
  });

  it('sends no sort for a column the endpoint does not sort by', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({ sortBy: [{ id: 'permissions', desc: true }] })));

    expect(result.current.querySettings).toMatchObject({ sortBy: null, order: null });
  });

  it('searches with the role column filter, trimmed', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({ filters: [{ id: 'name', value: '  admin ' }] })));

    expect(result.current.querySettings.search).toBe('admin');
  });

  it('sends no search for a blank filter', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({ filters: [{ id: 'name', value: '   ' }] })));

    expect(result.current.querySettings.search).toBeNull();
  });

  it('narrows the scope types to the chosen resource types', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({
      filters: [{ id: 'resourceType', value: [SCOPE_TYPES.LIBRARY] }],
    })));

    expect(result.current.querySettings.scopeTypes).toEqual([SCOPE_TYPES.LIBRARY]);
  });

  it('sends every viewable scope type once the resource type filter is cleared', () => {
    const { result } = renderSettings();
    act(() => result.current.handleTableFetch(tableState({
      filters: [{ id: 'resourceType', value: [SCOPE_TYPES.LIBRARY] }],
    })));

    act(() => result.current.handleTableFetch(tableState()));

    expect(result.current.querySettings.scopeTypes).toEqual(ALL_SCOPE_TYPES);
  });

  it('never sends a scope type the user cannot view', () => {
    const { result } = renderSettings([SCOPE_TYPES.LIBRARY]);

    act(() => result.current.handleTableFetch(tableState({
      filters: [{ id: 'resourceType', value: [SCOPE_TYPES.COURSE] }],
    })));

    expect(result.current.querySettings.scopeTypes).toEqual([SCOPE_TYPES.LIBRARY]);
  });

  it('keeps the viewable scope types in their order, whatever order they were chosen in', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({
      filters: [{ id: 'resourceType', value: [SCOPE_TYPES.LIBRARY, SCOPE_TYPES.COURSE] }],
    })));

    expect(result.current.querySettings.scopeTypes).toEqual(ALL_SCOPE_TYPES);
  });

  it('moves to the requested page', () => {
    const { result } = renderSettings();

    act(() => result.current.handleTableFetch(tableState({ pageIndex: 2 })));

    expect(result.current.querySettings.pageIndex).toBe(2);
  });

  it.each([
    ['search', { filters: [{ id: 'name', value: 'admin' }] }],
    ['resource type', { filters: [{ id: 'resourceType', value: [SCOPE_TYPES.LIBRARY] }] }],
    ['sort column', { sortBy: [{ id: 'members', desc: false }] }],
    ['sort order', { sortBy: [{ id: 'name', desc: true }] }],
  ])('goes back to the first page when the %s changes', (_, change) => {
    const { result } = renderSettings();
    act(() => result.current.handleTableFetch(tableState({ sortBy: [{ id: 'name', desc: false }] })));
    act(() => result.current.handleTableFetch(tableState({ sortBy: [{ id: 'name', desc: false }], pageIndex: 3 })));
    expect(result.current.querySettings.pageIndex).toBe(3);

    // The table still reports page 3: the reset can't rely on it having reset its own page.
    act(() => result.current.handleTableFetch(tableState({
      sortBy: [{ id: 'name', desc: false }], pageIndex: 3, ...change,
    })));

    expect(result.current.querySettings.pageIndex).toBe(0);
  });

  it('keeps the same settings when the table state changes nothing', () => {
    const { result } = renderSettings();
    act(() => result.current.handleTableFetch(tableState({ filters: [{ id: 'name', value: 'admin' }] })));
    const settings = result.current.querySettings;

    act(() => result.current.handleTableFetch(tableState({ filters: [{ id: 'name', value: 'admin ' }] })));

    expect(result.current.querySettings).toBe(settings);
  });

  it('keeps the same settings for a new array of the same viewable scope types', () => {
    const { result, rerender } = renderSettings();
    const settings = result.current.querySettings;

    rerender({ viewable: [...ALL_SCOPE_TYPES] });

    expect(result.current.querySettings).toBe(settings);
  });

  it('picks up the viewable scope types once the permissions load', () => {
    const { result, rerender } = renderSettings([]);
    expect(result.current.querySettings.scopeTypes).toEqual([]);

    rerender({ viewable: [SCOPE_TYPES.LIBRARY] });

    expect(result.current.querySettings.scopeTypes).toEqual([SCOPE_TYPES.LIBRARY]);
  });

  it('keeps the same handleTableFetch between renders', () => {
    const { result, rerender } = renderSettings();
    const { handleTableFetch } = result.current;

    rerender({ viewable: [SCOPE_TYPES.LIBRARY] });

    expect(result.current.handleTableFetch).toBe(handleTableFetch);
  });
});
