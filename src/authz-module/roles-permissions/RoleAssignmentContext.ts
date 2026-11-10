import { createContext, useContext } from 'react';

import type { Role } from '@src/authz-module/catalog';

interface RoleAssignment {
  // Whether the user may assign the role, so its "Assign role" menu item shows.
  canAssignRole: (role: Role) => boolean;
  // Opens the assign role wizard with the role preselected.
  assignRole: (role: Role) => void;
}

/**
 * Hands the table's assignment state to its action cells. DataTable keeps the cells of its
 * `additionalColumns` from the first render, so props passed through a cell factory would go
 * stale once the permissions load; context always reaches the cells with the current state.
 */
export const RoleAssignmentContext = createContext<RoleAssignment>({
  canAssignRole: () => false,
  assignRole: () => {},
});

export const useRoleAssignment = () => useContext(RoleAssignmentContext);
