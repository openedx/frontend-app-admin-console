import { renderHook } from '@testing-library/react';
import { usePermissions } from '@openedx/frontend-base';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useViewTeamPermissions } from './useViewTeamPermissions';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  usePermissions: jest.fn(),
}));

const mockUsePermissions = usePermissions as jest.Mock;

const permissionsData = ({ course, library }: { course: boolean; library: boolean }) => ({
  [SCOPE_TYPES.COURSE]: course,
  [SCOPE_TYPES.LIBRARY]: library,
  isLoading: false,
});

describe('useViewTeamPermissions', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue(permissionsData({ course: true, library: true }));
  });

  it('returns both flags allowed when permissions are granted', () => {
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(true);
    expect(result.current.isLibraryViewAllowed).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isCourseViewAllowed false when VIEW_COURSE_TEAM is denied', () => {
    mockUsePermissions.mockReturnValue(permissionsData({ course: false, library: true }));
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(false);
    expect(result.current.isLibraryViewAllowed).toBe(true);
  });

  it('returns isLibraryViewAllowed false when VIEW_LIBRARY_TEAM is denied', () => {
    mockUsePermissions.mockReturnValue(permissionsData({ course: true, library: false }));
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isCourseViewAllowed).toBe(true);
    expect(result.current.isLibraryViewAllowed).toBe(false);
  });

  it('defaults both to false while permissions are loading', () => {
    mockUsePermissions.mockReturnValue({ isLoading: true });
    const { result } = renderHook(() => useViewTeamPermissions());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isCourseViewAllowed).toBe(false);
    expect(result.current.isLibraryViewAllowed).toBe(false);
  });
});
