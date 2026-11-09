/** One row of the roles table: a catalog role within one of its scope types. */
export interface RoleRow {
  // A role spanning several scope types gets one row per scope type, so the id includes it.
  id: string;
  name: string;
  resourceType: string;
  // TODO: the catalog API (ADR 0028) has no member count or update time yet, so both are always
  // null and render "-". Fill them in once the backend API provides them.
  members: number | null;
  permissionCount: number;
  lastUpdated: string | null;
  isCustom: boolean;
}

export interface RoleCellProps {
  row: { original: RoleRow };
}
