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
  scope: { resource: string, type: 'COURSE' | 'LIBRARY' | 'GLOBAL' };
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

export type RolePermission = EnrichedPermission & {
  disabled: boolean;
};

export type RoleResourceGroup = {
  key: string;
  label: string;
  description: string;
  permissions: RolePermission[];
};

export type PermissionsRoleGrouped = Role & {
  resources: RoleResourceGroup[];
};

// Paragon table type
export interface TableCellValue<T> {
  row: {
    original: T;
  };
}

export type AppContextType = {
  authenticatedUser: {
    username: string;
    email: string;
  };
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
