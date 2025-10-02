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
}

export interface LibraryMetadata {
  id: string;
  org: string;
  title: string;
  slug: string;
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

// Paragon table type
export interface TableCellValue<T> {
  row: {
    original: T;
  };
}
