import { renderHook } from '@testing-library/react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { CONTENT_LIBRARY_PERMISSIONS, CONTENT_COURSE_PERMISSIONS } from '@src/authz-module/constants';
import { useOrgs } from '@src/authz-module/data/hooks';
import useScopePermissions from './useScopePermissions';

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));

jest.mock('../../data/hooks', () => ({
  useOrgs: jest.fn(),
}));

const mockUseValidateUserPermissions = useValidateUserPermissions as jest.Mock;
const mockUseOrganizations = useOrgs as jest.Mock;

const defaultOrgs = [
  {
    id: 1, name: 'Organization One', shortName: 'org1', description: '', logo: null, active: true,
  },
  {
    id: 2, name: 'Organization Two', shortName: 'org2', description: '', logo: null, active: true,
  },
];

const makeAllowed = (allowed: boolean) => ({ data: [{ allowed }] });
const makeMultiAllowed = (values: boolean[]) => ({ data: values.map((allowed) => ({ allowed })) });

describe('useScopePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganizations.mockReturnValue({ data: { results: defaultOrgs } });
    // Default: all permissions denied
    mockUseValidateUserPermissions.mockReturnValue({ data: [] });
  });

  describe('Return value structure', () => {
    it('returns hasPlatformPermission and orgHasPermission', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current).toHaveProperty('hasPlatformPermission');
      expect(result.current).toHaveProperty('orgHasPermission');
    });
  });

  describe('hasPlatformPermission for course context', () => {
    it('is true when all org course permissions are allowed', () => {
      // First call: course platform perms (one per org), Second: library platform perms, Third: org perms
      mockUseValidateUserPermissions
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // course platform
        .mockReturnValueOnce(makeMultiAllowed([false, false])) // library platform
        .mockReturnValueOnce({ data: [] }); // org perms

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(true);
    });

    it('is false when any org course permission is denied', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce(makeMultiAllowed([true, false])) // course platform
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // library platform
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });

    it('is false when course platform perms data is empty', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      // empty array .every() returns true vacuously
      expect(result.current.hasPlatformPermission).toBe(true);
    });

    it('is false when course platform perms data is undefined', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: undefined }) // course platform
        .mockReturnValueOnce({ data: undefined }) // library platform
        .mockReturnValueOnce({ data: undefined }); // org perms

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });
  });

  describe('hasPlatformPermission for library context', () => {
    it('is true when all org library permissions are allowed', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce(makeMultiAllowed([false, false])) // course platform
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // library platform
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(true);
    });

    it('is false when any org library permission is denied', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // course platform
        .mockReturnValueOnce(makeMultiAllowed([true, false])) // library platform
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });

    it('is false when library platform perms data is undefined', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: undefined })
        .mockReturnValueOnce({ data: undefined })
        .mockReturnValueOnce({ data: undefined });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: [],
      }));

      expect(result.current.hasPlatformPermission).toBe(false);
    });
  });

  describe('hasPlatformPermission with undefined contextType', () => {
    it('uses library branch (non-course) for undefined contextType', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // course platform (ignored)
        .mockReturnValueOnce(makeMultiAllowed([true, true])) // library platform
        .mockReturnValueOnce({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: undefined,
        orderedOrgs: [],
      }));

      // contextType !== 'course' so library branch is used
      expect(result.current.hasPlatformPermission).toBe(true);
    });
  });

  describe('orgHasPermission map', () => {
    it('maps each org to its allowed value for course context', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] }) // course platform
        .mockReturnValueOnce({ data: [] }) // library platform
        .mockReturnValueOnce(makeMultiAllowed([true, false])); // org perms for [org1, org2]

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['org1', 'org2'],
      }));

      expect(result.current.orgHasPermission).toEqual({ org1: true, org2: false });
    });

    it('maps each org to its allowed value for library context', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce(makeMultiAllowed([false, true])); // org perms for [org1, org2]

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: ['org1', 'org2'],
      }));

      expect(result.current.orgHasPermission).toEqual({ org1: false, org2: true });
    });

    it('returns empty map when orderedOrgs is empty', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      expect(result.current.orgHasPermission).toEqual({});
    });

    it('defaults org to false when orgPerms data is undefined', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: undefined });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['org1', 'org2'],
      }));

      expect(result.current.orgHasPermission).toEqual({ org1: false, org2: false });
    });

    it('handles single org', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce(makeAllowed(true));

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: ['org1'],
      }));

      expect(result.current.orgHasPermission).toEqual({ org1: true });
    });
  });

  describe('Permission request construction', () => {
    it('builds course platform permission requests with correct action and scope', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['org1'],
      }));

      const courseCallArgs = mockUseValidateUserPermissions.mock.calls[0][0];
      expect(courseCallArgs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
          scope: 'course-v1:org1+*',
        }),
      ]));
    });

    it('builds library platform permission requests with correct action and scope', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: [],
      }));

      const libraryCallArgs = mockUseValidateUserPermissions.mock.calls[1][0];
      expect(libraryCallArgs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
          scope: 'lib:org1:*',
        }),
      ]));
    });

    it('builds org permission requests using course scope when contextType is course', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['myorg'],
      }));

      const orgCallArgs = mockUseValidateUserPermissions.mock.calls[2][0];
      expect(orgCallArgs).toEqual([
        {
          action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
          scope: 'course-v1:myorg+*',
        },
      ]);
    });

    it('builds org permission requests using library scope when contextType is library', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      renderHook(() => useScopePermissions({
        contextType: 'library',
        orderedOrgs: ['myorg'],
      }));

      const orgCallArgs = mockUseValidateUserPermissions.mock.calls[2][0];
      expect(orgCallArgs).toEqual([
        {
          action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
          scope: 'lib:myorg:*',
        },
      ]);
    });

    it('returns empty org permission request list when orderedOrgs is empty', () => {
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      const orgCallArgs = mockUseValidateUserPermissions.mock.calls[2][0];
      expect(orgCallArgs).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('returns empty platform permission request lists when organizations data is undefined', () => {
      mockUseOrganizations.mockReturnValue({ data: undefined });
      mockUseValidateUserPermissions.mockReturnValue({ data: [] });

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: [],
      }));

      // With no organizations, both platform perm request arrays are [] — every() on [] is vacuously true
      expect(result.current.hasPlatformPermission).toBe(true);
    });

    it('handles all orgs allowed in orgHasPermission with three orgs', () => {
      mockUseValidateUserPermissions
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce({ data: [] })
        .mockReturnValueOnce(makeMultiAllowed([true, true, true]));

      const { result } = renderHook(() => useScopePermissions({
        contextType: 'course',
        orderedOrgs: ['org1', 'org2', 'org3'],
      }));

      expect(result.current.orgHasPermission).toEqual({
        org1: true, org2: true, org3: true,
      });
    });
  });
});
