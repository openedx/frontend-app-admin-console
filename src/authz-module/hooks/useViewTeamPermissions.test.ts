import { renderHook } from '@testing-library/react';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import { useViewTeamPermissions } from './useViewTeamPermissions';

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

const mockUsePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;

const permissionsData = ({ course, library }: { course: boolean; library: boolean }) => [
  { action: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM, allowed: course },
  { action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM, allowed: library },
];

describe('useViewTeamPermissions', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({ data: permissionsData({ course: true, library: true }), isLoading: false });
  });

  it('returns both flags allowed when permissions are granted', () => {
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(true);
    expect(result.current.isLibraryViewAllowed).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isCourseViewAllowed false when VIEW_COURSE_TEAM is denied', () => {
    mockUsePermissions.mockReturnValue({ data: permissionsData({ course: false, library: true }), isLoading: false });
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(false);
    expect(result.current.isLibraryViewAllowed).toBe(true);
  });

  it('returns isLibraryViewAllowed false when VIEW_LIBRARY_TEAM is denied', () => {
    mockUsePermissions.mockReturnValue({ data: permissionsData({ course: true, library: false }), isLoading: false });
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(true);
    expect(result.current.isLibraryViewAllowed).toBe(false);
  });

  it('defaults both to false while permissions are loading', () => {
    mockUsePermissions.mockReturnValue({ data: undefined, isLoading: true });
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isCourseViewAllowed).toBe(false);
    expect(result.current.isLibraryViewAllowed).toBe(false);
  });
});
