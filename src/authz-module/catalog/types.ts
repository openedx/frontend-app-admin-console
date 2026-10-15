export interface Category {
  id: string;
  displayName: string;
  description: string;
  icon: string | null;
}

export interface Permission {
  id: string;
  displayName: string;
  description: string;
  icon: string | null;
  categoryId: string | null;
  scopeTypes: string[];
}

export interface Role {
  role: string;
  displayName: string;
  description: string;
  icon: string | null;
  definitionKind: 'static' | 'user_defined';
  permissions: string[];
  scopeTypes: string[];
}

export interface AuthzCatalog {
  scopeTypes: string[];
  categories: Category[];
  permissions: Permission[];
  roles: Role[];
}

// A category with some of its permissions.
export interface CategoryPermissions {
  category: Category;
  permissions: Permission[];
}

// The part of the catalog that applies to one scope type.
export interface ScopeCatalog {
  scopeType: string;
  categories: Category[];
  permissions: Permission[];
  roles: Role[];
}
