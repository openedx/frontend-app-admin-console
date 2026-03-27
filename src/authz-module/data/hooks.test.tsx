import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useLibrary, usePermissionsByRole, useTeamMembers, useAssignTeamMembersRole, useRevokeUserRoles,
  useValidateUsers, useScopes, useOrganizations, useManagedScopeOrgs,
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

describe('useScopes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeScopesResponse = (next: string | null = null) => ({
    results: [{
      id: 'lib:123', name: 'Test Library', org: 'testorg', contextType: 'library',
    }],
    count: 1,
    next,
    previous: null,
  });

  it('returns pages data on success', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: makeScopesResponse() }),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].results).toHaveLength(1);
  });

  it('hasNextPage is false when next is null', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: makeScopesResponse(null) }),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('hasNextPage is true when next URL has page param', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: makeScopesResponse('http://localhost:8000/api/authz/v1/scopes/?page=2'),
      }),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('hasNextPage is false when next URL has no page param', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: makeScopesResponse('http://localhost:8000/api/authz/v1/scopes/'),
      }),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('hasNextPage is false when next is an invalid URL', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: makeScopesResponse('not-a-valid-url'),
      }),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('handles error when API call fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useScopes({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns organizations on success', async () => {
    const mockOrgs = [{ org: 'org1', name: 'Org One' }];
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { results: mockOrgs } }),
    });

    const { result } = renderHook(() => useOrganizations('library'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrgs);
  });

  it('handles error when API fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Failed')),
    });

    const { result } = renderHook(() => useOrganizations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useManagedScopeOrgs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch when contextType is undefined', async () => {
    const mockGet = jest.fn();
    getAuthenticatedHttpClient.mockReturnValue({ get: mockGet });

    const { result } = renderHook(() => useManagedScopeOrgs(undefined), { wrapper: createWrapper() });

    // Query is disabled, so it should not be loading or have fetched
    expect(result.current.isFetching).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('fetches and returns a Set of orgs when contextType is provided', async () => {
    const mockScopesResponse = {
      results: [
        {
          id: 'lib:123', name: 'Lib 1', org: 'org1', contextType: 'library',
        },
        {
          id: 'lib:456', name: 'Lib 2', org: 'org2', contextType: 'library',
        },
        {
          id: 'lib:789', name: 'Lib 3', org: '', contextType: 'library',
        },
      ],
      count: 3,
      next: null,
      previous: null,
    };
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockScopesResponse }),
    });

    const { result } = renderHook(() => useManagedScopeOrgs('library'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const orgs = result.current.data as Set<string>;
    expect(orgs.has('org1')).toBe(true);
    expect(orgs.has('org2')).toBe(true);
    // empty string org is filtered out
    expect(orgs.has('')).toBe(false);
    expect(orgs.size).toBe(2);
  });

  it('handles error when API fails', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('API error')),
    });

    const { result } = renderHook(() => useManagedScopeOrgs('course'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
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
