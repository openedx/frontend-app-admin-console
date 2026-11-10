import { createContext, useContext } from 'react';

import type { RoleRow } from './types';

interface RoleAssignment {
  // Whether the user may assign the row's role, so its "Assign role" menu item shows.
  canAssignRole: (row: RoleRow) => boolean;
  // Opens the assign role wizard with the row's role preselected.
  assignRole: (row: RoleRow) => void;
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
