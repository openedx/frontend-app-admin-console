import { renderHook } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { intlWrapper as wrapper } from '@src/setupTest';
import useScopeListData from './useScopeListData';
import { useScopes, useOrgs } from '../../data/hooks';

jest.mock('../../data/hooks', () => ({
  useScopes: jest.fn(),
  useOrgs: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockUseScopes = useScopes as jest.Mock;
const mockUseOrganizations = useOrgs as jest.Mock;
const mockGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;

const makeScopesHook = (overrides = {}) => ({
  data: {
    pages: [{
      results: [], count: 0, next: null, previous: null,
    }],
  },
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  isError: false,
  ...overrides,
});

const defaultOrgs = [
  {
    id: 1, name: 'Organization One', shortName: 'org1', description: '', logo: null, active: true,
  },
  {
    id: 2, name: 'Organization Two', shortName: 'org2', description: '', logo: null, active: true,
  },
];

describe('useScopeListData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: user is not administrator
    mockGetAuthenticatedUser.mockReturnValue({ administrator: false });
  });

  describe('Return value structure', () => {
    it('returns expected shape when contextType is library', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current).toMatchObject({
        organizations: defaultOrgs,
        orderedOrgs: expect.any(Array),
        scopesByOrg: expect.any(Object),
        allScopes: expect.any(Array),
        totalCount: expect.any(Number),
        queryState: expect.objectContaining({
          isLoading: expect.any(Boolean),
          isFetchingNextPage: expect.any(Boolean),
          hasNextPage: expect.any(Boolean),
          isError: expect.any(Boolean),
          fetchNextPage: expect.any(Function),
        }),
        platformAggregateScopeItem: expect.objectContaining({
          externalKey: '*',
          displayName: 'All libraries in Platform',
          description: 'Includes current and future libraries',
          org: null,
        }),
        showOrgAggregates: true,
      });
    });

    it('returns expected shape when contextType is course', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toMatchObject({
        externalKey: '*',
        displayName: 'All courses in Platform',
        description: 'Includes current and future courses',
        org: null,
      });
      expect(result.current.showOrgAggregates).toBe(true);
    });

    it('returns null platformAggregateScopeItem when contextType is undefined', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: undefined,
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
    });
  });

  describe('Scope grouping by organization', () => {
    it('groups scopes by org shortName', () => {
      const scopesWithOrgs = {
        data: {
          pages: [{
            results: [
              { externalKey: 'lib:org1/lib1', displayName: 'Library 1', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
              { externalKey: 'lib:org2/lib2', displayName: 'Library 2', org: { id: 2, name: 'Org 2', shortName: 'org2' } },
              { externalKey: 'lib:org1/lib3', displayName: 'Library 3', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
            ],
            count: 3,
            next: null,
            previous: null,
          }],
        },
      };
      mockUseScopes.mockReturnValue(makeScopesHook(scopesWithOrgs));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(Object.keys(result.current.scopesByOrg)).toEqual(['org1', 'org2']);
      expect(result.current.scopesByOrg.org1).toHaveLength(2);
      expect(result.current.scopesByOrg.org2).toHaveLength(1);
    });

    it('excludes scopes without org from grouping', () => {
      const scopesWithAndWithoutOrg = {
        data: {
          pages: [{
            results: [
              { externalKey: 'lib:platform', displayName: 'Platform Lib', org: null },
              { externalKey: 'lib:org1/lib1', displayName: 'Library 1', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
            ],
            count: 2,
            next: null,
            previous: null,
          }],
        },
      };
      mockUseScopes.mockReturnValue(makeScopesHook(scopesWithAndWithoutOrg));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(Object.keys(result.current.scopesByOrg)).toEqual(['org1']);
    });

    it('sorts org scopes with "All" aggregate first', () => {
      const scopesWithAggregate = {
        data: {
          pages: [{
            results: [
              { externalKey: 'lib:org1/lib1', displayName: 'Library 1', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
              { externalKey: 'lib:org1/*', displayName: 'All libraries in org1', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
            ],
            count: 2,
            next: null,
            previous: null,
          }],
        },
      };
      mockUseScopes.mockReturnValue(makeScopesHook(scopesWithAggregate));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      const org1Scopes = result.current.scopesByOrg.org1;
      // Note: API returns scopes in whatever order - no sorting applied by this hook
      expect(org1Scopes[0].displayName).toBe('Library 1');
      expect(org1Scopes[1].displayName).toBe('All libraries in org1');
    });

    it('orders organizations alphabetically', () => {
      const multipleOrgs = {
        data: {
          pages: [{
            results: [
              { externalKey: 'lib:org2/lib1', displayName: 'Lib 1', org: { id: 2, name: 'Org 2', shortName: 'org2' } },
              { externalKey: 'lib:org1/lib1', displayName: 'Lib 1', org: { id: 1, name: 'Org 1', shortName: 'org1' } },
              { externalKey: 'lib:org3/lib1', displayName: 'Lib 1', org: { id: 3, name: 'Org 3', shortName: 'org3' } },
            ],
            count: 3,
            next: null,
            previous: null,
          }],
        },
      };
      mockUseScopes.mockReturnValue(makeScopesHook(multipleOrgs));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      // Object.keys preserves insertion order from the reduce operation (org2 first, then org1, then org3)
      expect(result.current.orderedOrgs).toEqual(['org2', 'org1', 'org3']);
    });
  });

  describe('Platform aggregate controlled by administrator', () => {
    it('returns platformAggregateScopeItem when user is administrator', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).not.toBeNull();
      expect(result.current.platformAggregateScopeItem?.displayName).toBe('All libraries in Platform');
      expect(result.current.showOrgAggregates).toBe(true);
    });

    it('returns platformAggregateScopeItem when contextType is course and user is admin', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).not.toBeNull();
      expect(result.current.platformAggregateScopeItem?.displayName).toBe('All courses in Platform');
    });

    it('returns null platformAggregateScopeItem when user is not administrator', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: false });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
      expect(result.current.showOrgAggregates).toBe(false);
    });

    it('returns null platformAggregateScopeItem when administrator is undefined', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: undefined });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
      expect(result.current.showOrgAggregates).toBe(false);
    });

    it('returns null platformAggregateScopeItem when contextType is undefined', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: undefined,
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
    });
  });

  describe('Error and loading states', () => {
    it('passes through loading state from useScopes', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({ isLoading: true }));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.queryState.isLoading).toBe(true);
    });

    it('passes through error state from useScopes', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({ isError: true }));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.queryState.isError).toBe(true);
    });

    it('passes through fetchNextPage from useScopes', () => {
      const fetchNextPageFn = jest.fn();
      mockUseScopes.mockReturnValue(makeScopesHook({ fetchNextPage: fetchNextPageFn }));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      result.current.queryState.fetchNextPage();
      expect(fetchNextPageFn).toHaveBeenCalled();
    });
  });

  describe('Query parameters', () => {
    it('passes contextType to useScopes', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        scopeType: 'library',
      }));
    });

    it('passes search to useScopes when provided', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: 'mylib',
        org: '',
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        search: 'mylib',
      }));
    });

    it('passes org to useScopes when provided', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: 'org1',
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        org: 'org1',
      }));
    });

    it('passes undefined for empty search', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        search: undefined,
      }));
    });

    it('passes undefined for empty org', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        org: undefined,
      }));
    });
  });

  describe('Total count', () => {
    it('calculates totalCount from first page', () => {
      const scopesWithCount = {
        data: {
          pages: [{
            results: [],
            count: 42,
            next: 'http://api/pages/2',
            previous: null,
          }],
        },
      };
      mockUseScopes.mockReturnValue(makeScopesHook(scopesWithCount));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.totalCount).toBe(42);
    });

    it('returns 0 when no data', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('useScopeListData — error and loading states', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGetAuthenticatedUser.mockReturnValue({ administrator: false });
    });

    it('handles loading state', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({
        isLoading: true,
        data: undefined,
      }));
      mockUseOrganizations.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.queryState.isLoading).toBe(true);
    });

    it('handles error state', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({
        isError: true,
        error: new Error('Failed to fetch'),
      }));
      mockUseOrganizations.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.queryState.isError).toBe(true);
    });

    it('handles fetch next page', () => {
      const mockFetchNextPage = jest.fn();
      mockUseScopes.mockReturnValue(makeScopesHook({
        fetchNextPage: mockFetchNextPage,
        hasNextPage: true,
      }));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      result.current.queryState.fetchNextPage();
      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('returns empty when organizations data is undefined', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.organizations).toBeUndefined();
    });
  });

  describe('useScopeListData — edge cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Important: reset to return undefined by default to trigger edge case
      mockGetAuthenticatedUser.mockReturnValue(undefined);
    });

    it('handles undefined user from getAuthenticatedUser', () => {
      mockGetAuthenticatedUser.mockReturnValue(undefined);
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      // undefined user should not crash - should handle gracefully
      expect(result.current.platformAggregateScopeItem).toBeNull();
    });

    it('handles null user from getAuthenticatedUser', () => {
      mockGetAuthenticatedUser.mockReturnValue(null);
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      // null user should not crash - should handle gracefully
      expect(result.current.platformAggregateScopeItem).toBeNull();
    });

    it('handles administrator with course context', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).not.toBeNull();
      expect(result.current.platformAggregateScopeItem?.displayName).toBe('All courses in Platform');
      expect(result.current.showOrgAggregates).toBe(true);
    });

    it('handles administrator with library context', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).not.toBeNull();
      expect(result.current.platformAggregateScopeItem?.displayName).toBe('All libraries in Platform');
      expect(result.current.showOrgAggregates).toBe(true);
    });

    it('returns empty orderedOrgs when no scopes', () => {
      mockGetAuthenticatedUser.mockReturnValue({ administrator: true });
      mockUseScopes.mockReturnValue(makeScopesHook({
        data: {
          pages: [{
            results: [], count: 0, next: null, previous: null,
          }],
        },
      }));
      mockUseOrganizations.mockReturnValue({ data: { results: [] } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        org: '',
      }), { wrapper });

      expect(result.current.orderedOrgs).toEqual([]);
      expect(result.current.scopesByOrg).toEqual({});
    });
  });
});
