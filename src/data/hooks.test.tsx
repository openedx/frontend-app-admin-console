import { act, ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useValidateUserPermissions, useUserAccount, useValidateUserPermissionsNonSuspense } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return wrapper;
};

const permissions = [
  {
    action: 'act:read',
    object: 'lib:test-lib',
    scope: 'org:OpenedX',
  },
];

const mockValidPermissions = [
  { action: 'act:read', object: 'lib:test-lib', allowed: true },
];

const mockInvalidPermissions = [
  { action: 'act:read', object: 'lib:test-lib', allowed: false },
];

const mockUserAccountData = {
  username: 'john.doe',
  bio: 'Software Developer',
  accountPrivacy: 'public',
  country: 'US',
  dateJoined: '2023-01-15T10:30:00Z',
  levelOfEducation: 'bachelor',
  timeZone: 'America/New_York',
  profileImage: {
    hasImage: true,
    imageUrlFull: 'https://example.com/profile_full.jpg',
    imageUrlLarge: 'https://example.com/profile_large.jpg',
    imageUrlMedium: 'https://example.com/profile_medium.jpg',
    imageUrlSmall: 'https://example.com/profile_small.jpg',
  },
  courseCertificates: null,
  languageProficiencies: [],
  socialLinks: [],
};

const mockEmptyUserData = {
  username: 'jane.smith',
  bio: null,
  accountPrivacy: 'private',
  country: null,
  dateJoined: '2023-06-20T14:15:00Z',
  levelOfEducation: null,
  timeZone: null,
  profileImage: {
    hasImage: false,
    imageUrlFull: '',
    imageUrlLarge: '',
    imageUrlMedium: '',
    imageUrlSmall: '',
  },
  courseCertificates: null,
  languageProficiencies: [],
  socialLinks: [],
};

describe('useValidateUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns allowed true when permissions are valid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: mockValidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissions(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data[0].allowed).toBe(true);
  });

  it('returns allowed false when permissions are invalid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockInvalidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissions(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data[0].allowed).toBe(false);
  });

  it('handles error when the API call fails', async () => {
    const mockError = new Error('API Error');

    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('API Error')),
    });

    try {
      act(() => {
        renderHook(() => useValidateUserPermissions(permissions), {
          wrapper: createWrapper(),
        });
      });
    } catch (error) {
      expect(error).toEqual(mockError); // Check for the expected error
    }
  });
});

describe('useValidateUserPermissionsNonSuspense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns allowed true when permissions are valid', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: mockValidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data[0].allowed).toBe(true);
  });

  it('returns allowed false when permissions are invalid', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockInvalidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data[0].allowed).toBe(false);
  });

  it('handles error when the API call fails', async () => {
    const mockError = new Error('API Error');
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockRejectedValueOnce(mockError),
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('starts with loading state', () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockImplementation(() => new Promise(() => {})),
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(permissions), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('handles empty permissions array', async () => {
    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense([]), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
  });

  it('does not retry on failure', async () => {
    const mockPost = jest.fn().mockRejectedValue(new Error('Network Error'));
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('handles multiple permissions validation', async () => {
    const multiplePermissions = [
      {
        action: 'act:read',
        object: 'lib:test-lib',
        scope: 'org:OpenedX',
      },
      {
        action: 'act:write',
        object: 'course:test-course',
        scope: 'org:OpenedX',
      },
    ];

    const multipleValidPermissions = [
      { action: 'act:read', object: 'lib:test-lib', allowed: true },
      { action: 'act:write', object: 'course:test-course', allowed: false },
    ];

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: multipleValidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissionsNonSuspense(multiplePermissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].allowed).toBe(true);
    expect(result.current.data[1].allowed).toBe(false);
  });
});

describe('useUserAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user account data successfully', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockUserAccountData }),
    });

    const { result } = renderHook(() => useUserAccount('john.doe'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUserAccountData);
    expect(result.current.data?.username).toBe('john.doe');
  });

  it('handles user account data with minimal information', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockEmptyUserData }),
    });

    const { result } = renderHook(() => useUserAccount('jane.smith'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.username).toBe('jane.smith');
    expect(result.current.data?.bio).toBeNull();
    expect(result.current.data?.country).toBeNull();
  });

  it('handles API error gracefully', async () => {
    const mockError = new Error('User not found');
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValueOnce(mockError),
    });

    const { result } = renderHook(() => useUserAccount('nonexistent.user'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('does not refetch on window focus', async () => {
    const mockGet = jest.fn().mockResolvedValueOnce({ data: mockUserAccountData });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const { result } = renderHook(() => useUserAccount('john.doe'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('updates data when username changes', async () => {
    const mockGet = jest.fn()
      .mockResolvedValueOnce({ data: mockUserAccountData })
      .mockResolvedValueOnce({ data: mockEmptyUserData });

    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const { result, rerender } = renderHook(
      ({ username }) => useUserAccount(username),
      {
        wrapper: createWrapper(),
        initialProps: { username: 'john.doe' },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.username).toBe('john.doe');

    rerender({ username: 'jane.smith' });

    await waitFor(() => expect(result.current.data?.username).toBe('jane.smith'));
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
