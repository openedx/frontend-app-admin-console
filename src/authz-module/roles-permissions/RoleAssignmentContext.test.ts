import { renderHook } from '@testing-library/react';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useRoleAssignment } from './RoleAssignmentContext';
import type { RoleRow } from './types';

const row: RoleRow = {
  id: 'library_admin',
  name: 'Library Admin',
  resourceTypes: [SCOPE_TYPES.LIBRARY],
  members: 0,
  permissionCount: 0,
  lastUpdated: null,
  isCustom: false,
};

describe('useRoleAssignment', () => {
  // A cell rendered outside the roles table must not offer an assignment it cannot open.
  it('lets no role be assigned without a provider', () => {
    const { result } = renderHook(() => useRoleAssignment());

    expect(result.current.canAssignRole(row)).toBe(false);
    expect(() => result.current.assignRole(row)).not.toThrow();
  });
});
