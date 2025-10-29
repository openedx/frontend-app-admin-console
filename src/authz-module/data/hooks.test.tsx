import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useLibrary, usePermissionsByRole, useTeamMembers, useAssignTeamMembersRole, useRevokeUserRoles,
  useUpdateLibrary,
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

describe('useUpdateLibrary', () => {
  const queryKeyTest = ['org.openedx.frontend.app.adminConsole', 'authz', 'library', 'lib:123'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls updateLibrary with correct params and updates cache', async () => {
    const mockData = { id: 'lib:123', title: 'Library Test' };
    getAuthenticatedHttpClient.mockReturnValue({
      patch: jest.fn().mockResolvedValue({ data: mockData }),
    });
    const { result } = renderHook(() => useUpdateLibrary(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        libraryId: 'lib:123',
        updatedData: { title: 'Library Test' },
      });
    });

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
  });

  it('sets query data on success', async () => {
    const mockData = { id: 'lib:123', title: 'Updated Library' };
    getAuthenticatedHttpClient.mockReturnValue({
      patch: jest.fn().mockResolvedValue({ data: mockData }),
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLibrary(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        libraryId: 'lib:123',
        updatedData: { title: 'Updated Library' },
      });
    });

    // verify cache updated with the returned data
    expect(queryClient.getQueryData(queryKeyTest)).toEqual(mockData);
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
  });

  it('invalidates query on settled', async () => {
    const mockData = { id: 'lib:123', title: 'Final Title' };
    getAuthenticatedHttpClient.mockReturnValue({
      patch: jest.fn().mockResolvedValue({ data: mockData }),
    });
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLibrary(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        libraryId: 'lib:123',
        updatedData: { title: 'Final Title' },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeyTest,
    });
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
  });
});
