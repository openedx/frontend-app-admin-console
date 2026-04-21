import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useLibrary,
  usePermissionsByRole,
  useTeamMembers,
  useAssignTeamMembersRole,
  useRevokeUserRoles,
  useAllRoleAssignments,
  useOrgs,
  useScopes,
  useUserAssignedRoles,
  useValidateUsers,
} from './hooks';

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

jest.mock('@src/constants', () => ({
  appId: 'test-app',
}));

const mockMembers = {
  count: 2,
  results: [
    {
      fullName: 'Alice',
      username: 'user1',
      email: 'alice@example.com',
      roles: ['admin', 'author'],
    },
    {
      fullName: 'Bob',
      username: 'user2',
      email: 'bob@example.com',
      roles: ['collaborator'],
    },
  ],
};

const mockLibrary = {
  id: 'lib:123',
  org: 'demo-org',
  title: 'Test Library',
  slug: 'test-library',
};

const mockAssignments = {
  results: [
    {
      isSuperadmin: false,
      role: 'course_staff',
      org: 'OpenedX',
      scope: 'course-v1:OpenedX+DemoX+DemoCourse',
      permissionCount: 27,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    },
  ],
  count: 1,
  next: null,
  previous: null,
};

const mockOrgs = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 'org1', name: 'Organization 1' },
    { id: 'org2', name: 'Organization 2' },
  ],
};

const mockScopes = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      externalKey: 'course-v1:OpenedX+DemoX+DemoCourse',
      displayName: 'Open edX Demo Course',
      org: {
        id: 1,
        created: '2026-04-02T19:30:36.779095Z',
        modified: '2026-04-02T19:30:36.779095Z',
        name: 'OpenedX',
        shortName: 'OpenedX',
        description: '',
        logo: null,
        active: true,
      },
    },
    {
      externalKey: 'lib:WGU:CSPROB',
      displayName: 'Computer Science Problems',
      org: {
        id: 2,
        created: '2026-04-02T19:31:21.196446Z',
        modified: '2026-04-02T19:31:21.196446Z',
        name: 'WGU',
        shortName: 'WGU',
        description: '',
        logo: null,
        active: true,
      },
    },
  ],
};

const mockQuerySettings = {
  roles: null,
  scopes: null,
  organizations: null,
  search: null,
  order: null,
  sortBy: null,
  pageSize: 10,
  pageIndex: 0,
};

const mockUserAssignments = {
  count: 3,
  results: [
    {
      id: '1',
      role: 'library_admin',
      scope: 'lib:test-library-1',
      permissionCount: 15,
    },
    {
      id: '2',
      role: 'course_staff',
      scope: 'course:test-course-1',
      permissionCount: 8,
    },
    {
      id: '3',
      role: 'django.superuser',
      scope: 'global',
      permissionCount: 50,
    },
  ],
  next: 'http://api.example.com/userAssignments?page=2',
  previous: null,
};

const mockEmptyUserAssignments = {
  count: 0,
  results: [],
  next: null,
  previous: null,
};

const mockFilteredUserAssignments = {
  count: 1,
  results: [
    {
      id: '1',
      role: 'library_admin',
      scope: 'lib:test-library-1',
      permissionCount: 15,
    },
  ],
  next: null,
  previous: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
      client={queryClient}
    >{children}
    </QueryClientProvider>
  );

  return wrapper;
};

describe('useTeamMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data when API call succeeds', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockMembers }),
    });

    const { result } = renderHook(() => useTeamMembers('lib:123', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockMembers);
  });

  it('appends roles and search params when provided', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { count: 0, results: [] } }),
    });

    const { result } = renderHook(
      () => useTeamMembers('lib:123', { ...mockQuerySettings, roles: 'admin', search: 'alice' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const mockGetFn = getAuthenticatedHttpClient().get as jest.Mock;
    const calledUrl = new URL(mockGetFn.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('roles')).toBe('admin');
    expect(calledUrl.searchParams.get('search')).toBe('alice');
  });

  it('appends sort params when sortBy and order are provided', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { count: 0, results: [] } }),
    });

    const { result } = renderHook(
      () => useTeamMembers('lib:123', { ...mockQuerySettings, sortBy: 'username', order: 'asc' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const mockGetFn = getAuthenticatedHttpClient().get as jest.Mock;
    const calledUrl = new URL(mockGetFn.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('sort_by')).toBe('username');
    expect(calledUrl.searchParams.get('order')).toBe('asc');
  });

  it('handles error when API call fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('API failure')),
    });

    const { result } = renderHook(() => useTeamMembers('lib:123', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns metadata on success', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockLibrary }),
    });

    const { result } = renderHook(
      () => useLibrary('lib123'),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(mockLibrary);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  it('maps allow_public_read to allowPublicRead', async () => {
    const rawLibrary = {
      id: 'lib:org/test',
      org: 'org',
      title: 'Test Library',
      slug: 'test-library',
      allow_public_read: true,
    };
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: rawLibrary }),
    });

    const { result } = renderHook(() => useLibrary('lib:org/test'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual({
      id: 'lib:org/test',
      org: 'org',
      title: 'Test Library',
      slug: 'test-library',
      allowPublicRead: true,
    });
  });

  it('throws on error', () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Not found')),
    });

    const wrapper = createWrapper();
    try {
      act(() => {
        renderHook(() => useLibrary('lib123'), { wrapper });
      });
    } catch (e) {
      expect(e).toEqual(new Error('Not found'));
    }

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
  });
});

describe('usePermissionsByRole', () => {
  it('fetches roles for a given scope', async () => {
    const mockRoles = [
      { role: 'admin', permissions: ['perm1'], userCount: 1 },
      { role: 'user', permissions: ['perm2'], userCount: 2 },
    ];

    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { results: mockRoles } }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePermissionsByRole('lib'), { wrapper });
    await waitFor(() => result.current.data !== undefined);
    expect(result.current.data).toEqual(mockRoles);
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
  });

  it('returns error if getRoles fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Not found')),
    });
    const wrapper = createWrapper();
    try {
      act(() => {
        renderHook(() => usePermissionsByRole('lib'), { wrapper });
      });
    } catch (e) {
      expect(e).toEqual(new Error('Not found'));
    }
  });
});

describe('useAssignTeamMembersRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully adds team members', async () => {
    const mockResponse = {
      completed: [
        { user: 'jdoe', status: 'role_added' },
        { user: 'alice@example.com', status: 'already_has_role' },
      ],
      errors: [],
    };

    getAuthenticatedHttpClient.mockReturnValue({
      put: jest.fn().mockResolvedValue({ data: mockResponse }),
    });

    const { result } = renderHook(() => useAssignTeamMembersRole(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ data: { scope: 'lib:123', users: ['jdoe'], role: 'author' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('handles error when adding team members fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      put: jest.fn().mockRejectedValue(new Error('Failed to add members')),
    });

    const { result } = renderHook(() => useAssignTeamMembersRole(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ data: { scope: 'lib:123', users: ['jdoe'], role: 'author' } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.error).toEqual(new Error('Failed to add members'));
  });
});

describe('useValidateUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully validates users', async () => {
    const mockResponse = {
      validUsers: ['jdoe'],
      invalidUsers: ['unknown_user'],
    };

    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockResponse }),
    });

    const { result } = renderHook(() => useValidateUsers(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ data: { users: ['jdoe', 'unknown_user'] } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('handles error when validation fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('Validation failed')),
    });

    const { result } = renderHook(() => useValidateUsers(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ data: { users: ['jdoe'] } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('Validation failed'));
  });
});

describe('useRevokeUserRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully revokes user roles', async () => {
    const mockResponse = {
      completed: [
        {
          userIdentifiers: 'jdoe',
          status: 'role_removed',
        },
      ],
      errors: [],
    };

    getAuthenticatedHttpClient.mockReturnValue({
      delete: jest.fn().mockResolvedValue({ data: mockResponse }),
    });

    const { result } = renderHook(() => useRevokeUserRoles(), {
      wrapper: createWrapper(),
    });

    const revokeRoleData = {
      scope: 'lib:123',
      users: 'jdoe',
      role: 'author',
    };

    await act(async () => {
      result.current.mutate({ data: revokeRoleData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('handles error when revoking roles fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      delete: jest.fn().mockRejectedValue(new Error('Failed to revoke roles')),
    });

    const { result } = renderHook(() => useRevokeUserRoles(), {
      wrapper: createWrapper(),
    });

    const revokeRoleData = {
      scope: 'lib:123',
      users: 'jdoe',
      role: 'author',
    };

    await act(async () => {
      result.current.mutate({ data: revokeRoleData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.error).toEqual(new Error('Failed to revoke roles'));
  });

  it('constructs URL with correct query parameters', async () => {
    const mockDelete = jest.fn().mockResolvedValue({
      data: { completed: [], errors: [] },
    });

    getAuthenticatedHttpClient.mockReturnValue({
      delete: mockDelete,
    });

    const { result } = renderHook(() => useRevokeUserRoles(), {
      wrapper: createWrapper(),
    });

    const revokeRoleData = {
      scope: 'lib:org/test-lib',
      users: 'user1@example.com',
      role: 'instructor',
    };

    await act(async () => {
      result.current.mutate({ data: revokeRoleData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalled();
    const calledUrl = new URL(mockDelete.mock.calls[0][0]);

    // Verify the URL contains the correct query parameters
    expect(calledUrl.searchParams.get('users')).toBe(revokeRoleData.users);
    expect(calledUrl.searchParams.get('role')).toBe(revokeRoleData.role);
    expect(calledUrl.searchParams.get('scope')).toBe(revokeRoleData.scope);
  });
});

describe('useAllRoleAssignments', () => {
  beforeEach(() => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn(() => Promise.resolve({ data: mockAssignments })),
    });
  });

  it('fetches and returns role assignments', async () => {
    const { result } = renderHook(
      () => useAllRoleAssignments({
        roles: null,
        scopes: null,
        organizations: null,
        search: null,
        order: null,
        sortBy: null,
        pageSize: 10,
        pageIndex: 0,
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data?.results).toHaveLength(1);
      expect(result.current.data?.results[0].username).toBe('johndoe');
      expect(result.current.data?.count).toBe(1);
    });
  });

  it('handles empty results', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValueOnce({
      get: jest.fn(() => Promise.resolve({
        data: {
          results: [], count: 0, next: null, previous: null,
        },
      })),
    });
    const { result } = renderHook(
      () => useAllRoleAssignments({
        roles: null,
        scopes: null,
        organizations: null,
        search: null,
        order: null,
        sortBy: null,
        pageSize: 10,
        pageIndex: 0,
      }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data?.results).toEqual([]);
      expect(result.current.data?.count).toBe(0);
    });
  });
});

describe('useOrgs', () => {
  beforeEach(() => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn(() => Promise.resolve({ data: mockOrgs })),
    });
  });

  it('fetches and returns organizations', async () => {
    const { result } = renderHook(() => useOrgs(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.data?.results).toHaveLength(2);
      expect(result.current.data?.results[0].name).toBe('Organization 1');
      expect(result.current.data?.count).toBe(2);
    });
  });

  it('handles empty results', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValueOnce({
      get: jest.fn(() => Promise.resolve({
        data: {
          count: 0, next: null, previous: null, results: [],
        },
      })),
    });
    const { result } = renderHook(() => useOrgs(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.data?.results).toEqual([]);
      expect(result.current.data?.count).toBe(0);
    });
  });
});

describe('useScopes', () => {
  beforeEach(() => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn(() => Promise.resolve({ data: mockScopes })),
    });
  });

  it('fetches and returns scopes', async () => {
    const { result } = renderHook(() => useScopes(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.data?.results).toHaveLength(2);
      expect(result.current.data?.results[0].displayName).toBe('Open edX Demo Course');
      expect(result.current.data?.count).toBe(2);
    });
  });

  it('handles empty results', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValueOnce({
      get: jest.fn(() => Promise.resolve({
        data: {
          count: 0, next: null, previous: null, results: [],
        },
      })),
    });
    const { result } = renderHook(() => useScopes(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.data?.results).toEqual([]);
      expect(result.current.data?.count).toBe(0);
    });
  });
});

describe('useUserAssignedRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user role assignments when API call succeeds', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockUserAssignments }),
    });

    const { result } = renderHook(() => useUserAssignedRoles('john.doe', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUserAssignments);
    expect(result.current.data?.results).toHaveLength(3);
    expect(result.current.data?.count).toBe(3);
  });

  it('returns empty results when user has no role assignments', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockEmptyUserAssignments }),
    });

    const { result } = renderHook(() => useUserAssignedRoles('newuser', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.results).toHaveLength(0);
    expect(result.current.data?.count).toBe(0);
  });

  it('applies query settings for filtering and pagination', async () => {
    const filteredQuerySettings = {
      ...mockQuerySettings,
      roles: 'library_admin',
      search: 'library',
      pageSize: 5,
      pageIndex: 1,
    };

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockFilteredUserAssignments }),
    });

    const { result } = renderHook(() => useUserAssignedRoles('john.doe', filteredQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].role).toBe('library_admin');
  });

  it('handles API error when fetching user assignments fails', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('User not found')),
    });

    const { result } = renderHook(() => useUserAssignedRoles('nonexistent.user', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('User not found');
    expect(result.current.data).toBeUndefined();
  });

  it('does not refetch on window focus', async () => {
    const mockGet = jest.fn().mockResolvedValue({ data: mockUserAssignments });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const { result } = renderHook(() => useUserAssignedRoles('john.doe', mockQuerySettings), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('updates when query settings change', async () => {
    const mockGet = jest.fn()
      .mockResolvedValueOnce({ data: mockUserAssignments })
      .mockResolvedValueOnce({ data: mockFilteredUserAssignments });

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const { result, rerender } = renderHook(
      ({ querySettings }) => useUserAssignedRoles('john.doe', querySettings),
      {
        wrapper: createWrapper(),
        initialProps: { querySettings: mockQuerySettings },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.count).toBe(3);

    rerender({
      querySettings: {
        ...mockQuerySettings,
        roles: 'library_admin',
        pageSize: 1,
      },
    });

    await waitFor(() => expect(result.current.data?.count).toBe(1));
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});

describe('useScopes', () => {
  const mockScopesData = {
    results: [
      {
        displayName: 'Test Library 1',
        scope: 'lib:test-library-1',
      },
      {
        displayName: 'Test Course 1',
        scope: 'course:test-course-1',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns scopes when API call succeeds', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockScopesData }),
    });

    const { result } = renderHook(() => useScopes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockScopesData);
    expect(result.current.data?.results).toHaveLength(2);
  });

  it('handles search parameter', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { results: [mockScopesData.results[0]] } }),
    });

    const { result } = renderHook(() => useScopes('library'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(1);
  });

  it('handles error when API call fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('API failure')),
    });

    const { result } = renderHook(() => useScopes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
