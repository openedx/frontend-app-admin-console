import { renderHook } from '@testing-library/react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import useScopePermissions from './useScopePermissions';

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));

const mockUseValidateUserPermissions = useValidateUserPermissions as jest.Mock;

describe('useScopePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUserPermissions.mockReturnValue({ data: [] });
  });

  describe('hasPlatformPermission', () => {
    it('is true when the platform-wide entry (index 0) is allowed', () => {
      mockUseValidateUserPermissions.mockReturnValue({
        data: [{ allowed: true }, { allowed: false }],
      });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT'],
      }));

      expect(result.current.hasPlatformPermission).toBe(true);
    });

    it('is false when the platform-wide entry is not allowed', () => {
      mockUseValidateUserPermissions.mockReturnValue({
        data: [{ allowed: false }, { allowed: true }],
      });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT'],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });

    it('is false when contextType is undefined', () => {
      const { result } = renderHook(() => useScopePermissions({
        contextType: undefined,
        orderedOrgs: ['MIT'],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });
  });

  describe('orgHasPermission', () => {
    it('returns empty map when orderedOrgs is empty', () => {
      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current.orgHasPermission).toEqual({});
    });

    it('maps allowed responses by org slug index for course context', () => {
      // Index 0 is the platform-wide entry; org entries follow.
      mockUseValidateUserPermissions.mockReturnValue({
        data: [{ allowed: false }, { allowed: true }, { allowed: false }],
      });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT', 'HarvardX'],
      }));

      expect(result.current.orgHasPermission).toEqual({ MIT: true, HarvardX: false });
    });

    it('maps allowed responses by org slug index for library context', () => {
      // Index 0 is the platform-wide entry; org entries follow.
      mockUseValidateUserPermissions.mockReturnValue({
        data: [{ allowed: false }, { allowed: false }, { allowed: true }],
      });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: ['MIT', 'HarvardX'],
      }));

      expect(result.current.orgHasPermission).toEqual({ MIT: false, HarvardX: true });
    });

    it('defaults to false when the response entry is missing', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT'],
      }));

      expect(result.current.orgHasPermission).toEqual({ MIT: false });
    });

    it('defaults to false when orgPerms data is undefined', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT', 'HarvardX'],
      }));

      expect(result.current.orgHasPermission).toEqual({ MIT: false, HarvardX: false });
    });
  });

  describe('permission request construction', () => {
    it('uses MANAGE_COURSE_TEAM action with the platform-wide and per-org course scopes', () => {
      renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['MIT', 'HarvardX'],
      }));

      expect(mockUseValidateUserPermissions).toHaveBeenCalledWith([
        { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, scope: 'course-v1:*' },
        { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, scope: 'course-v1:MIT+*' },
        { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, scope: 'course-v1:HarvardX+*' },
      ]);
    });

    it('uses MANAGE_LIBRARY_TEAM action with the platform-wide and per-org lib scopes', () => {
      renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: ['MIT', 'HarvardX'],
      }));

      expect(mockUseValidateUserPermissions).toHaveBeenCalledWith([
        { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, scope: 'lib:*' },
        { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, scope: 'lib:MIT:*' },
        { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, scope: 'lib:HarvardX:*' },
      ]);
    });

    it('validates only the platform-wide scope when orderedOrgs is empty', () => {
      renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(mockUseValidateUserPermissions).toHaveBeenCalledWith([
        { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, scope: 'course-v1:*' },
      ]);
    });

    it('passes empty array when contextType is undefined', () => {
      renderHook(() => useScopePermissions({
        contextType: undefined,
        orderedOrgs: ['MIT'],
      }));

      expect(mockUseValidateUserPermissions).toHaveBeenCalledWith([]);
    });
  });
});
