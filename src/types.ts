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
}
export interface Role extends RoleMetadata {
  userCount: number;
  permissions: string[];
}

export type ResourceMetadata = {
  key: string;
  label: string;
  description: string;
};

export type PermissionMetadata = {
  key: string;
  resource: string;
  label?: string;
  description?: string;
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
