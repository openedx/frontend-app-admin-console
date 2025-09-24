import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLibrary, useTeamMembers } from './hooks';
import * as api from './api';

const mockMembers = [
  {
    displayName: 'Alice',
    username: 'user1',
    email: 'alice@example.com',
    roles: ['admin', 'author'],
  },
  {
    displayName: 'Bob',
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
    jest.spyOn(api, 'getTeamMembers').mockResolvedValue(mockMembers);

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib:123');
    expect(result.current.data).toEqual(mockMembers);
  });

  it('handles error when API call fails', async () => {
    jest
      .spyOn(api, 'getTeamMembers')
      .mockRejectedValue(new Error('API failure'));

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib:123');
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns metadata on success', async () => {
    jest.spyOn(api, 'getLibrary').mockResolvedValue(mockLibrary);

    const { result } = renderHook(
      () => useLibrary('lib123'),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(mockLibrary);
      expect(api.getLibrary).toHaveBeenCalledWith('lib123');
    });
  });

  it('throws on error', () => {
    jest
      .spyOn(api, 'getLibrary')
      .mockRejectedValue(new Error('Not found'));

    const wrapper = createWrapper();
    try {
      renderHook(() => useLibrary('lib123'), { wrapper });
    } catch (e) {
      expect(e).toEqual(new Error('Not found'));
    }

    expect(api.getLibrary).toHaveBeenCalledWith('lib123');
  });
});
