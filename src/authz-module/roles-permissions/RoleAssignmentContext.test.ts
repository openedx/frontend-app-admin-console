import { renderHook } from '@testing-library/react';
import { buildCatalogRole } from '@src/authz-module/catalog/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useRoleAssignment } from './RoleAssignmentContext';

const role = buildCatalogRole('library_admin', { scopeTypes: [SCOPE_TYPES.LIBRARY] });

describe('useRoleAssignment', () => {
  // A cell rendered outside the roles table must not offer an assignment it cannot open.
  it('lets no role be assigned without a provider', () => {
    const { result } = renderHook(() => useRoleAssignment());

    expect(result.current.canAssignRole(role)).toBe(false);
    expect(() => result.current.assignRole(role)).not.toThrow();
  });
});
