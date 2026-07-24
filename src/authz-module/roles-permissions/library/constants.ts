import {
  PermissionMetadata, ResourceMetadata, Role, RoleMetadata,
} from '@src/types';
import {
  Group, CollectionsBookmark, Notes, AutoAwesomeMosaic,
  RemoveRedEye,
  Settings,
  DownloadDone,
  Plus,
  EditOutline,
  Delete,
  SpinnerIcon,
} from '@openedx/paragon/icons';

export const CONTENT_LIBRARY_PERMISSIONS = {
  DELETE_LIBRARY: 'content_libraries.delete_library',
  MANAGE_LIBRARY_TAGS: 'content_libraries.manage_library_tags',
  VIEW_LIBRARY: 'content_libraries.view_library',

  EDIT_LIBRARY_CONTENT: 'content_libraries.edit_library_content',
  PUBLISH_LIBRARY_CONTENT: 'content_libraries.publish_library_content',
  REUSE_LIBRARY_CONTENT: 'content_libraries.reuse_library_content',

  MANAGE_LIBRARY_TEAM: 'content_libraries.manage_library_team',
  VIEW_LIBRARY_TEAM: 'content_libraries.view_library_team',

  CREATE_LIBRARY_COLLECTION: 'content_libraries.create_library_collection',
  EDIT_LIBRARY_COLLECTION: 'content_libraries.edit_library_collection',
  DELETE_LIBRARY_COLLECTION: 'content_libraries.delete_library_collection',
};

// Note: this information will eventually come from the backend API
// but for the MVP we decided to manage it in the frontend
export const libraryRolesMetadata: RoleMetadata[] = [
  {
    role: 'library_admin',
    name: 'Library Admin',
    description: 'The Library Admin has full control over the library, including managing users, modifying content, and handling publishing workflows. They ensure content is properly maintained and accessible as needed.',
    contextType: 'library',
  },
  {
    role: 'library_author',
    name: 'Library Author',
    description: 'The Library Author is responsible for creating, editing, and publishing content within a library. They can manage tags and collections but cannot delete libraries or manage users.',
    contextType: 'library',
  },
  {
    role: 'library_contributor',
    name: 'Library Contributor',
    description: 'The Library Contributor can create and edit content within a library but cannot publish it. They support the authoring process while leaving final publishing to Authors or Admins.',
    contextType: 'library',
  },
  {
    role: 'library_user',
    name: 'Library User',
    description: 'The Library User can view and reuse content but cannot edit or delete any resource.',
    contextType: 'library',
  },
];

export const libraryResourceTypes: ResourceMetadata[] = [
  {
    key: 'library',
    label: 'Library',
    description: 'Permissions related to viewing, managing, and publishing the library structure and metadata.',
    icon: CollectionsBookmark,
  },
  {
    key: 'library_content',
    label: 'Content',
    description: 'Permissions for editing, publishing, and reusing content within the library.',
    icon: Notes,
  },
  {
    key: 'library_team',
    label: 'Team',
    description: 'Permissions for viewing and managing users who have access to the library.',
    icon: Group,
  },
  {
    key: 'library_collection',
    label: 'Collection',
    description: 'Permissions for creating and managing content collections within the library.',
    icon: AutoAwesomeMosaic,
  },
];

export const libraryPermissions: PermissionMetadata[] = [
  {
    key: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY,
    resource: 'library',
    label: 'View',
    description: 'See the library in Studio and access its content in read-only mode.',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS,
    resource: 'library',
    label: 'Manage tags',
    description: 'Create, edit, and delete tags on this library.',
    icon: Settings,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY,
    resource: 'library',
    label: 'Delete',
    description: 'Allows users to delete the entire content library.',
    icon: Delete,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT,
    resource: 'library_content',
    label: 'Edit',
    description: 'Create, edit, and delete content items in the library.',
    icon: EditOutline,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.PUBLISH_LIBRARY_CONTENT,
    resource: 'library_content',
    label: 'Publish',
    description: 'Publish individual content items to make them available for reuse in courses.',
    icon: DownloadDone,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT,
    resource: 'library_content',
    label: 'Reuse',
    description: 'Add published content from this library to a course.',
    icon: SpinnerIcon,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
    resource: 'library_team',
    label: 'View',
    description: 'See the list of users with a role assigned to this library.',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
    resource: 'library_team',
    label: 'Manage',
    description: 'Add, change, or remove role assignments for this library from the Roles and Permissions console.',
    icon: Settings,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION,
    resource: 'library_collection',
    label: 'Create',
    description: 'Create new collections to organize content within the library.',
    icon: Plus,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION,
    resource: 'library_collection',
    label: 'Edit',
    description: 'Update the name and contents of existing collections.',
    icon: EditOutline,
  },
  {
    key: CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION,
    resource: 'library_collection',
    label: 'Delete',
    description: 'Permanently remove collections from the library.',
    icon: Delete,
  },
];

const LIBRARY_ROLE_PERMISSIONS: Record<string, string[]> = {
  library_admin: [
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY,
    CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS,
    CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.PUBLISH_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
    CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
    CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT,
  ],
  library_author: [
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY,
    CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.PUBLISH_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
    CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION,
  ],
  library_contributor: [
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY,
    CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
    CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION,
    CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION,
  ],
  library_user: [
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY,
    CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT,
    CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
  ],
};

export const libraryRolesWithPermissions: Role[] = libraryRolesMetadata.map((meta) => ({
  ...meta,
  scope: '',
  userCount: 1,
  permissions: LIBRARY_ROLE_PERMISSIONS[meta.role] ?? [],
}));
