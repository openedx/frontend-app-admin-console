import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useLibrary, usePermissionsByRole, useTeamMembers, useAssignTeamMembersRole,
} from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockMembers = [
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
];

const mockLibrary = {
  id: 'lib:123',
  org: 'demo-org',
  title: 'Test Library',
  slug: 'test-library',
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
      get: jest.fn().mockResolvedValue({ data: { results: mockMembers } }),
    });

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
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

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
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
