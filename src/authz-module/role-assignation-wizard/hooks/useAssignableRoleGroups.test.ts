import { renderHook } from '@testing-library/react';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { MANAGE_TEAM_ACTIONS, SCOPE_TYPES } from '@src/authz-module/constants';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import useAssignableRoleGroups from './useAssignableRoleGroups';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseValidatePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

const allow = (...scopeTypes: string[]) => ({
  data: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY].map((scopeType) => ({
    action: MANAGE_TEAM_ACTIONS[scopeType],
    allowed: scopeTypes.includes(scopeType),
  })),
});

const groupScopeTypes = (roleGroups: { scopeType: string }[]) => roleGroups.map(({ scopeType }) => scopeType);

describe('useAssignableRoleGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog();
    mockUseValidatePermissions.mockReturnValue(allow(SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY));
    mockUseCourseAuthoringFlag.mockReturnValue({ isCourseAuthoringEnabled: true });
  });

  it('offers the roles of every scope type whose team the user can manage', () => {
    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(true);
    expect(groupScopeTypes(result.current.roleGroups)).toEqual([SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY]);
    expect(result.current.roleGroups[0].roles.map(({ role }) => role)).toEqual(['course_admin', 'course_staff']);
  });

  it('leaves out the scope types whose team the user cannot manage', () => {
    mockUseValidatePermissions.mockReturnValue(allow(SCOPE_TYPES.LIBRARY));

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
    mockUseValidatePermissions.mockReturnValue(allow());

    const { result } = renderHook(() => useAssignableRoleGroups());

    expect(result.current.canAssignRole).toBe(false);
    expect(result.current.roleGroups).toEqual([]);
  });

  it('cannot assign while the permissions are loading', () => {
    mockUseValidatePermissions.mockReturnValue({ data: undefined });

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
