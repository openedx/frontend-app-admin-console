import { PermissionMetadata, ResourceMetadata, RoleMetadata } from 'types';

// Note: this information will eventually come from the backend API
// but for the MVP we decided to manage it in the frontend
export const libraryRolesMetadata: RoleMetadata[] = [
  { role: 'library_admin', name: 'Library Admin', description: 'The Library Admin has full control over the library, including managing users, modifying content, and handling publishing workflows. They ensure content is properly maintained and accessible as needed.' },
  { role: 'library_author', name: 'Library Author', description: 'The Library Author is responsible for creating, editing, and publishing content within a library. They can manage tags and collections but cannot delete libraries or manage users.' },
  { role: 'library_collaborator', name: 'Library Collaborator', description: 'The Library Collaborator can create and edit content within a library but cannot publish it. They support the authoring process while leaving final publishing to Authors or Admins.' },
  { role: 'library_user', name: 'Library User', description: 'The Library User can view and reuse content but cannot edit or delete any resource.' },
];

export const libraryResourceTypes: ResourceMetadata[] = [
  { key: 'library', label: 'Library', description: 'Permissions related to the library as a whole.' },
  { key: 'library_content', label: 'Content', description: 'Permissions to create, edit, delete, and publish individual content items within the library.' },
  { key: 'library_collection', label: 'Collection', description: 'Permissions to create, edit, and delete content collections within the library.' },
  { key: 'library_team', label: 'Team', description: 'Permissions to manage user access and roles within the library.' },
];

export const libraryPermissions: PermissionMetadata[] = [
  { key: 'view_library', resource: 'library', description: 'View content, search, filter, and sort within the library.' },
  { key: 'manage_library_tags', resource: 'library', description: 'Add or remove tags from content.' },

  { key: 'edit_library_content', resource: 'library_content', description: 'Edit content in draft mode' },
  { key: 'publish_library_content', resource: 'library_content', description: 'Publish content, making it available for reuse' },
  { key: 'reuse_library_content', resource: 'library_content', description: 'Reuse published content within a course.' },

  { key: 'create_library_collection', resource: 'library_collection', description: 'Create new collections within a library.' },
  { key: 'edit_library_collection', resource: 'library_collection', description: 'Add or remove content from existing collections.' },
  { key: 'delete_library_collection', resource: 'library_collection', description: 'Delete entire collections from the library.' },

  { key: 'manage_library_team', resource: 'library_team', description: 'View the list of users who have access to the library.' },
  { key: 'view_library_team', resource: 'library_team', description: 'Add, remove, and assign roles to users within the library.' },
];
