import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getTeamMembers,
  assignTeamMembersRole,
  validateUsers,
  getLibrary,
  getPermissionsByRole,
  revokeUserRoles,
  getScopes,
  getOrganizations,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@src/data/utils', () => ({
  getApiUrl: (path: string) => `http://localhost:8000${path}`,
  getStudioApiUrl: (path: string) => `http://localhost:8010${path}`,
}));

jest.mock('@edx/frontend-platform', () => ({
  camelCaseObject: (obj: unknown) => obj,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const baseQuerySettings = {
  roles: null,
  search: null,
  order: null,
  sortBy: null,
  pageSize: 10,
  pageIndex: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  });
});

describe('getTeamMembers', () => {
  it('builds URL with required params and returns data', async () => {
    const mockData = { count: 1, results: [{ username: 'user1' }] };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await getTeamMembers('lib:123', baseQuerySettings);

    expect(mockGet).toHaveBeenCalled();
    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('scope')).toBe('lib:123');
    expect(calledUrl.searchParams.get('page_size')).toBe('10');
    expect(calledUrl.searchParams.get('page')).toBe('1');
    expect(result).toEqual(mockData);
  });

  it('appends roles and search params when provided', async () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });

    await getTeamMembers('lib:123', {
      ...baseQuerySettings,
      roles: 'admin',
      search: 'alice',
    });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('roles')).toBe('admin');
    expect(calledUrl.searchParams.get('search')).toBe('alice');
  });

  it('appends sort params when sortBy and order are provided', async () => {
    mockGet.mockResolvedValue({ data: { count: 0, results: [] } });

    await getTeamMembers('lib:123', {
      ...baseQuerySettings,
      sortBy: 'username',
      order: 'asc',
    });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('sort_by')).toBe('username');
    expect(calledUrl.searchParams.get('order')).toBe('asc');
  });
});

describe('assignTeamMembersRole', () => {
  it('sends PUT request and returns camelCased data', async () => {
    const mockResponse = { completed: [{ userIdentifier: 'jdoe', status: 'role_added' }], errors: [] };
    mockPut.mockResolvedValue({ data: mockResponse });

    const result = await assignTeamMembersRole({ users: ['jdoe'], role: 'admin', scope: 'lib:123' });

    expect(mockPut).toHaveBeenCalledWith(
      'http://localhost:8000/api/authz/v1/roles/users/',
      { users: ['jdoe'], role: 'admin', scope: 'lib:123' },
    );
    expect(result).toEqual(mockResponse);
  });
});

describe('validateUsers', () => {
  it('sends POST request and returns valid/invalid users', async () => {
    const mockResponse = { validUsers: ['jdoe'], invalidUsers: ['unknown'] };
    mockPost.mockResolvedValue({ data: mockResponse });

    const result = await validateUsers({ users: ['jdoe', 'unknown'] });

    expect(mockPost).toHaveBeenCalledWith(
      'http://localhost:8000/api/authz/v1/users/validate',
      { users: ['jdoe', 'unknown'] },
    );
    expect(result).toEqual(mockResponse);
  });

  it('returns empty lists when all users are valid', async () => {
    const mockResponse = { validUsers: ['jdoe', 'alice'], invalidUsers: [] };
    mockPost.mockResolvedValue({ data: mockResponse });

    const result = await validateUsers({ users: ['jdoe', 'alice'] });
    expect(result.invalidUsers).toHaveLength(0);
    expect(result.validUsers).toHaveLength(2);
  });
});

describe('getLibrary', () => {
  it('fetches library and maps fields correctly', async () => {
    const mockData = {
      id: 'lib:org/test',
      org: 'org',
      title: 'Test Library',
      slug: 'test-library',
      allow_public_read: true,
    };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await getLibrary('lib:org/test');

    expect(mockGet).toHaveBeenCalledWith('http://localhost:8010/api/libraries/v2/lib:org/test/');
    expect(result).toEqual({
      id: 'lib:org/test',
      org: 'org',
      title: 'Test Library',
      slug: 'test-library',
      allowPublicRead: true,
    });
  });
});

describe('getPermissionsByRole', () => {
  it('fetches roles with scope param and returns results', async () => {
    const mockRoles = [{ role: 'admin', permissions: ['perm1'], userCount: 2 }];
    mockGet.mockResolvedValue({ data: { results: mockRoles } });

    const result = await getPermissionsByRole('lib:123');

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('scope')).toBe('lib:123');
    expect(result).toEqual(mockRoles);
  });
});

describe('revokeUserRoles', () => {
  it('sends DELETE with correct query params', async () => {
    const mockResponse = { completed: [{ userIdentifiers: 'jdoe', status: 'role_removed' }], errors: [] };
    mockDelete.mockResolvedValue({ data: mockResponse });

    const result = await revokeUserRoles({ users: 'jdoe', role: 'admin', scope: 'lib:123' });

    expect(mockDelete).toHaveBeenCalled();
    const calledUrl = new URL(mockDelete.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('users')).toBe('jdoe');
    expect(calledUrl.searchParams.get('role')).toBe('admin');
    expect(calledUrl.searchParams.get('scope')).toBe('lib:123');
    expect(result).toEqual(mockResponse);
  });
});

describe('getScopes', () => {
  const mockScopesData = {
    results: [{
      id: 'lib:123', name: 'Test Library', org: 'testorg', contextType: 'library',
    }],
    count: 1,
    next: null,
    previous: null,
  };

  it('builds URL with default page and pageSize when no optional params', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    const result = await getScopes({});

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('page')).toBe('1');
    expect(calledUrl.searchParams.get('page_size')).toBe('10');
    expect(calledUrl.searchParams.get('search')).toBeNull();
    expect(calledUrl.searchParams.get('org')).toBeNull();
    expect(calledUrl.searchParams.get('management_permission_only')).toBeNull();
    expect(result).toEqual(mockScopesData);
  });

  it('appends search param when provided', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    await getScopes({ search: 'mylib' });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('search')).toBe('mylib');
  });

  it('appends org param when provided', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    await getScopes({ org: 'testorg' });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('org')).toBe('testorg');
  });

  it('appends management_permission_only when set to true', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    await getScopes({ managementPermissionOnly: true });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('management_permission_only')).toBe('true');
  });

  it('uses provided page and pageSize', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    await getScopes({ page: 3, pageSize: 25 });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('page')).toBe('3');
    expect(calledUrl.searchParams.get('page_size')).toBe('25');
  });

  it('does not append managementPermissionOnly when false', async () => {
    mockGet.mockResolvedValue({ data: mockScopesData });

    await getScopes({ managementPermissionOnly: false });

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('management_permission_only')).toBeNull();
  });
});

describe('getOrganizations', () => {
  it('returns organizations from data.results when present', async () => {
    const mockData = {
      results: [{ org: 'org1', name: 'Org One' }, { org: 'org2', name: 'Org Two' }],
    };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await getOrganizations();

    const calledUrl = new URL(mockGet.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe('/api/authz/v1/organizations/');
    expect(result).toEqual(mockData.results);
  });

  it('falls back to data directly when results is not present', async () => {
    const mockData = [{ org: 'org1', name: 'Org One' }];
    mockGet.mockResolvedValue({ data: mockData });

    const result = await getOrganizations();

    expect(result).toEqual(mockData);
  });

  it('accepts contextType param (currently unused in URL but accepted)', async () => {
    mockGet.mockResolvedValue({ data: { results: [] } });

    const result = await getOrganizations('course');

    expect(result).toEqual([]);
    expect(mockGet).toHaveBeenCalled();
  });
});
