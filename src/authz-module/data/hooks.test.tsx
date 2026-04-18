import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useLibrary, usePermissionsByRole, useTeamMembers, useAssignTeamMembersRole, useRevokeUserRoles,
  useAllRoleAssignments,
  useOrgs,
  useScopes,
} from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
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
  search: null,
  order: null,
  sortBy: null,
  pageSize: 10,
  pageIndex: 0,
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

  describe('useAssignTeamMembersRole', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('successfully adds team members', async () => {
      const mockResponse = {
        completed: [
          {
            user: 'jdoe',
            status: 'role_added',
          },
          {
            user: 'alice@example.com',
            status: 'already_has_role',
          },
        ],
        errors: [],
      };

      getAuthenticatedHttpClient.mockReturnValue({
        put: jest.fn().mockResolvedValue({ data: mockResponse }),
      });

      const { result } = renderHook(() => useAssignTeamMembersRole(), {
        wrapper: createWrapper(),
      });

      const addTeamMemberData = {
        scope: 'lib:123',
        users: ['jdoe'],
        role: 'author',
      };

      await act(async () => {
        result.current.mutate({ data: addTeamMemberData });
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

      const addTeamMemberData = {
        scope: 'lib:123',
        users: ['jdoe'],
        role: 'author',
      };

      await act(async () => {
        result.current.mutate({ data: addTeamMemberData });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
      expect(result.current.error).toEqual(new Error('Failed to add members'));
    });
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
