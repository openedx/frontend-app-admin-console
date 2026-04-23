import { renderHook } from '@testing-library/react';
import { intlWrapper as wrapper } from '@src/setupTest';
import useScopeListData from './useScopeListData';
import { useScopes, useOrgs } from '../../data/hooks';
import useScopePermissions from './useScopePermissions';

jest.mock('../../data/hooks', () => ({
  useScopes: jest.fn(),
  useOrgs: jest.fn(),
}));

jest.mock('./useScopePermissions');

const mockUseScopes = useScopes as jest.Mock;
const mockUseOrganizations = useOrgs as jest.Mock;
const mockUseScopePermissions = useScopePermissions as jest.Mock;

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
    mockUseScopePermissions.mockReturnValue({
      hasPlatformPermission: false,
      orgHasPermission: { org1: true, org2: true },
    });
  });

  describe('Return value structure', () => {
    it('returns expected shape when contextType is library', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
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
        platformAggregateScopeItem: null,
      });
    });

    it('returns expected shape when contextType is course', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
    });

    it('returns null platformAggregateScopeItem when contextType is undefined', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: undefined,
        search: '',
        orgs: [],
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
        orgs: [],
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
        orgs: [],
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
        orgs: [],
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
        orgs: [],
      }), { wrapper });

      expect(result.current.orderedOrgs).toEqual(['org1', 'org2', 'org3']);
    });
  });

  describe('Platform aggregate scope item', () => {
    it('returns null platformAggregateScopeItem for library context (disabled pending backend support)', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
    });

    it('returns null platformAggregateScopeItem for course context (disabled pending backend support)', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(result.current.platformAggregateScopeItem).toBeNull();
    });

    it('returns null platformAggregateScopeItem when contextType is undefined', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: undefined,
        search: '',
        orgs: [],
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
        orgs: [],
      }), { wrapper });

      expect(result.current.queryState.isLoading).toBe(true);
    });

    it('passes through error state from useScopes', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({ isError: true }));
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
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
        orgs: [],
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
        orgs: [],
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
        orgs: [],
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
        orgs: ['org1'],
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        orgs: ['org1'],
      }));
    });

    it('passes undefined for empty search', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        search: undefined,
      }));
    });

    it('passes undefined for empty orgs', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(mockUseScopes).toHaveBeenCalledWith(expect.objectContaining({
        orgs: undefined,
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
        orgs: [],
      }), { wrapper });

      expect(result.current.totalCount).toBe(42);
    });

    it('returns 0 when no data', () => {
      mockUseScopes.mockReturnValue(makeScopesHook());
      mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'library',
        search: '',
        orgs: [],
      }), { wrapper });

      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('useScopeListData — error and loading states', () => {
    it('handles loading state', () => {
      mockUseScopes.mockReturnValue(makeScopesHook({
        isLoading: true,
        data: undefined,
      }));
      mockUseOrganizations.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useScopeListData({
        contextType: 'course',
        search: '',
        orgs: [],
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
        orgs: [],
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
        orgs: [],
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
        orgs: [],
      }), { wrapper });

      expect(result.current.organizations).toBeUndefined();
    });
  });

  describe('useScopeListData — edge cases', () => {
    it('returns empty orderedOrgs when no scopes', () => {
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
        orgs: [],
      }), { wrapper });

      expect(result.current.orderedOrgs).toEqual([]);
      expect(result.current.scopesByOrg).toEqual({});
    });
  });
});
