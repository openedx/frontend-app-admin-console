/** One row of the roles table: one role of the page the server returned. */
export interface RoleRow {
  // The catalog role key, e.g. `library_admin`.
  id: string;
  name: string;
  resourceTypes: string[];
  members: number;
  permissionCount: number;
  lastUpdated: string | null;
  isCustom: boolean;
}

export interface RoleCellProps {
  row: { original: RoleRow };
}
