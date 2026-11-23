import { renderHook } from '@testing-library/react';
import { usePermissions } from '@openedx/frontend-base';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import useAssignableRoleGroups from './useAssignableRoleGroups';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  usePermissions: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUsePermissions = usePermissions as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

// The answer `usePermissions` gives for the manage-team query: a boolean under each scope type.
const allow = (...scopeTypes: string[]) => ({
  [SCOPE_TYPES.COURSE]: scopeTypes.includes(SCOPE_TYPES.COURSE),
  [SCOPE_TYPES.LIBRARY]: scopeTypes.includes(SCOPE_TYPES.LIBRARY),
  isLoading: false,
});

const groupScopeTypes = (roleGroups: { scopeType: string }[]) => roleGroups.map(({ scopeType }) => scopeType);

describe('useAssignableRoleGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog();
    mockUsePermissions.mockReturnValue(allow(SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY));
    mockUseCourseAuthoringFlag.mockReturnValue({ isCourseAuthoringEnabled: true });
  });

  it('offers the roles of every scope type whose team the user can manage', () => {
    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(true);
    expect(groupScopeTypes(result.current.roleGroups)).toEqual([SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY]);
    expect(result.current.roleGroups[0].roles.map(({ role }) => role)).toEqual(['course_admin', 'course_staff']);
  });

  it('leaves out the scope types whose team the user cannot manage', () => {
    mockUsePermissions.mockReturnValue(allow(SCOPE_TYPES.LIBRARY));

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(true);
    expect(groupScopeTypes(result.current.roleGroups)).toEqual([SCOPE_TYPES.LIBRARY]);
  });

  it('leaves out the course roles while course authoring is disabled', () => {
    mockUseCourseAuthoringFlag.mockReturnValue({ isCourseAuthoringEnabled: false });

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(groupScopeTypes(result.current.roleGroups)).toEqual([SCOPE_TYPES.LIBRARY]);
  });

  it('cannot assign when the user manages no team', () => {
    mockUsePermissions.mockReturnValue(allow());

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(false);
    expect(result.current.roleGroups).toEqual([]);
  });

  it('cannot assign while the permissions are loading', () => {
    mockUsePermissions.mockReturnValue({
      [SCOPE_TYPES.COURSE]: undefined, [SCOPE_TYPES.LIBRARY]: undefined, isLoading: true,
    });

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(false);
    expect(result.current.roleGroups).toEqual([]);
  });

  it('passes the catalog loading and error state through', () => {
    mockAuthzCatalog({ isLoading: true });

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
