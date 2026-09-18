export interface PermissionValidationRequest {
  action: string;
  scope?: string;
}

export interface PermissionValidationResponse extends PermissionValidationRequest {
  allowed: boolean;
}

// Libraries AuthZ types
export interface TeamMember {
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
  scope: { resource: string; type: 'COURSE' | 'LIBRARY' | 'GLOBAL' };
  organization: string;
  role: string;
}

export interface LibraryMetadata {
  id: string;
  org: string;
  title: string;
  slug: string;
  allowPublicRead: boolean;
}

export interface RoleMetadata {
  role: string;
  name: string;
  description: string;
  contextType: string;
  disabled?: boolean;
}
// TODO: remove unnecessary fields when libraries gets removed
export interface Role extends RoleMetadata {
  scope: string;
  userCount: number;
  permissions: string[];
}

export interface ResourceMetadata {
  key: string;
  label: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface PermissionMetadata {
  key: string;
  resource: string;
  label?: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export type PermissionItem = ResourceMetadata & {
  perms: PermissionMetadata[];
};

export interface Org {
  id: string;
  name: string;
  shortName: string;
}

export interface Scope {
  externalKey: string;
  displayName: string;
  description?: string;
  org: Org | null;
}

// Permissions Matrix

export type EnrichedPermission = PermissionMetadata & {
  actionKey: string;
};

export type PermissionWithRoles = EnrichedPermission & {
  roles: Record<string, boolean>;
};

export type PermissionsResourceGrouped = ResourceMetadata & {
  permissions: PermissionWithRoles[];
};

export interface UserRole {
  isSuperadmin?: boolean;
  role: string;
  org: string;
  scope: string;
  permissionCount: number;
  fullName?: string;
  username?: string;
  email?: string;
}

export interface RoleToDelete {
  role: string;
  name?: string;
  scope: string;
}

export type UserRoleWithPermissions = UserRole & {
  canManageScope?: boolean;
};

/**
 * A single role assignment nested under a team member in the user-grouped listing.
 * Mirrors `results[].assignments[]` of `GET /api/authz/v1/users/`.
 */
export interface TeamMemberAssignment {
  role: string;
  org: string;
  /** Scope external key (e.g. `course-v1:Org+Course+Run`). Identifies the scope and is
   *  what the scope filter sends back to the API — not shown to the user. */
  scope: string;
  /** Human-readable scope name shown in the table. The API returns an empty string for
   *  glob scopes and for scopes whose backing course or library no longer exists, so
   *  callers fall back to `scope`. */
  scopeDisplayName: string;
  permissionCount: number;
}

/**
 * A team member as returned by the user-grouped assignments endpoint: one entry per
 * user, carrying the first few of their assignments. `assignmentCount` counts every
 * assignment behind that slice, so it can exceed `assignments.length`. Both are scoped
 * to the active role, org and scope filters and to what the caller may view.
 */
export interface TeamMember {
  username: string;
  fullName: string;
  email: string;
  assignmentCount: number;
  assignments: TeamMemberAssignment[];
}
