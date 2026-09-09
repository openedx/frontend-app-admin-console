export interface PermissionValidationRequest {
  action: string;
  scope?: string;
}

export interface PermissionValidationResponse extends PermissionValidationRequest {
  allowed: boolean;
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

export type ResourceMetadata = {
  key: string;
  label: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type PermissionMetadata = {
  key: string;
  resource: string;
  label?: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type PermissionItem = ResourceMetadata & {
  perms: PermissionMetadata[];
};

export type Org = {
  id: string;
  name: string;
  shortName: string;
};

export type Scope = {
  externalKey: string;
  displayName: string;
  description?: string;
  org: Org | null;
};

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

export type RoleToDelete = {
  role: string;
  name?: string;
  scope: string;
};

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
 * user, carrying up to `assignments_limit` of their assignments. `assignmentCount` is
 * the user's absolute total, so it can exceed `assignments.length`.
 */
export interface TeamMember {
  username: string;
  fullName: string;
  email: string;
  assignmentCount: number;
  assignments: TeamMemberAssignment[];
}
