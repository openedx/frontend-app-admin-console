export interface PermissionValidationRequest {
  action: string;
  object?: string;
  scope?: string;
}

export interface PermissionValidationResponse extends PermissionValidationRequest {
  allowed: boolean;
}

// Libraries AuthZ types
export interface TeamMember {
  displayName: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LibraryMetadata {
  id: string;
  org: string;
  title: string;
  slug: string;
}

export interface TeamRole {
  role: string;
  description: string;
  userCount: number;
  objects: { object: string; description: string; actions: string[] }[];
}

// Paragon table type
export interface TableCellValue<T> {
  row: {
    original: T;
  };
}
