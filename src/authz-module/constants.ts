import { PermissionMetadata, ResourceMetadata, RoleMetadata } from 'types';

export const CONTENT_LIBRARY_PERMISSIONS = {
  DELETE_LIBRARY: 'content_libraries.delete_library',
  MANAGE_LIBRARY_TAGS: 'content_libraries.manage_library_tags',
  VIEW_LIBRARY: 'content_libraries.view_library',

  EDIT_LIBRARY_CONTENT: 'content_libraries.edit_library_content',
  PUBLISH_LIBRARY_CONTENT: 'content_libraries.publish_library_content',
  REUSE_LIBRARY_CONTENT: 'content_libraries.reuse_library_content',

  CREATE_LIBRARY_COLLECTION: 'content_libraries.create_library_collection',
  EDIT_LIBRARY_COLLECTION: 'content_libraries.edit_library_collection',
  DELETE_LIBRARY_COLLECTION: 'content_libraries.delete_library_collection',

  MANAGE_LIBRARY_TEAM: 'content_libraries.manage_library_team',
  VIEW_LIBRARY_TEAM: 'content_libraries.view_library_team',
};

export const CONTENT_COURSE_PERMISSIONS = {
  VIEW_COURSE: 'courses.view_course',
  CREATE_COURSE: 'courses.create_course',
  EDIT_COURSE_CONTENT: 'courses.edit_course_content',
  PUBLISH_COURSE_CONTENT: 'courses.publish_course_content',

  REVIEW_COURSE_LIBRARY_UPDATES: 'courses.manage_library_updates',

  VIEW_COURSE_UPDATES: 'courses.view_course_updates',
  MANAGE_COURSE_UPDATES: 'courses.manage_course_updates',

  VIEW_COURSE_PAGES_RESOURCES: 'courses.view_pages_and_resources',
  MANAGE_COURSE_PAGES_RESOURCES: 'courses.manage_pages_and_resources',

  VIEW_COURSE_FILES: 'courses.view_files',
  CREATE_COURSE_FILES: 'courses.create_files',
  EDIT_COURSE_FILES: 'courses.edit_files',
  DELETE_COURSE_FILES: 'courses.delete_files',

  VIEW_COURSE_SCHEDULE: 'courses.view_schedule',
  EDIT_COURSE_SCHEDULE: 'courses.edit_schedule',
  VIEW_COURSE_DETAILS: 'courses.view_details',
  EDIT_COURSE_DETAILS: 'courses.edit_details',

  VIEW_COURSE_GRADING_SETTINGS: 'courses.view_grading_settings',
  EDIT_COURSE_GRADING_SETTINGS: 'courses.edit_grading_settings',

  VIEW_COURSE_TEAM: 'courses.view_course_team',
  MANAGE_COURSE_TEAM: 'courses.manage_course_team',
  MANAGE_COURSE_GROUP_CONFIGURATION: 'courses.manage_group_configurations',

  MANAGE_COURSE_TAGS: 'courses.manage_tags',
  MANAGE_COURSE_TAXONOMIES: 'courses.manage_taxonomies',

  MANAGE_COURSE_ADVANCED_SETTINGS: 'courses.manage_advanced_settings',
  MANAGE_COURSE_CERTIFICATES: 'courses.manage_certificates',

  IMPORT_COURSE: 'courses.import_course',
  EXPORT_COURSE: 'courses.export_course',
  EXPORT_COURSE_TAGS: 'courses.export_tags',

  VIEW_COURSE_CHECKLISTS: 'courses.view_checklists',
  VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS: 'courses.view_global_staff_and_superadmins',
};

// Note: this information will eventually come from the backend API
// but for the MVP we decided to manage it in the frontend
export const libraryRolesMetadata: RoleMetadata[] = [
  { role: 'library_admin', name: 'Library Admin', description: 'The Library Admin has full control over the library, including managing users, modifying content, and handling publishing workflows. They ensure content is properly maintained and accessible as needed.' },
  { role: 'library_author', name: 'Library Author', description: 'The Library Author is responsible for creating, editing, and publishing content within a library. They can manage tags and collections but cannot delete libraries or manage users.' },
  { role: 'library_contributor', name: 'Library Contributor', description: 'The Library Contributor can create and edit content within a library but cannot publish it. They support the authoring process while leaving final publishing to Authors or Admins.' },
  { role: 'library_user', name: 'Library User', description: 'The Library User can view and reuse content but cannot edit or delete any resource.' },
];

export const libraryResourceTypes: ResourceMetadata[] = [
  { key: 'library', label: 'Library', description: 'Permissions related to the library as a whole.' },
  { key: 'library_content', label: 'Content', description: 'Permissions to create, edit, delete, and publish individual content items within the library.' },
  { key: 'library_collection', label: 'Collection', description: 'Permissions to create, edit, and delete content collections within the library.' },
  { key: 'library_team', label: 'Team', description: 'Permissions to manage user access and roles within the library.' },
];

export const libraryPermissions: PermissionMetadata[] = [
  { key: CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY, resource: 'library', description: 'Allows the user to delete the library and all its contents.' },
  { key: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS, resource: 'library', description: 'Add or remove tags from content.' },
  { key: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY, resource: 'library', description: 'View content, search, filter, and sort within the library.' },

  { key: CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT, resource: 'library_content', description: 'Edit content in draft mode' },
  { key: CONTENT_LIBRARY_PERMISSIONS.PUBLISH_LIBRARY_CONTENT, resource: 'library_content', description: 'Publish content, making it available for reuse' },
  { key: CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT, resource: 'library_content', description: 'Reuse published content within a course.' },

  { key: CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION, resource: 'library_collection', description: 'Create new collections within a library.' },
  { key: CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION, resource: 'library_collection', description: 'Add or remove content from existing collections.' },
  { key: CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION, resource: 'library_collection', description: 'Delete entire collections from the library.' },

  { key: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, resource: 'library_team', description: 'View the list of users who have access to the library.' },
  { key: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM, resource: 'library_team', description: 'Add, remove, and assign roles to users within the library.' },
];

export const DEFAULT_TOAST_DELAY = 5000;
export const RETRY_TOAST_DELAY = 120_000; // 2 minutes
export const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));

export const ROUTES = {
  LIBRARIES_TEAM_PATH: '/libraries/:libraryId',
  LIBRARIES_USER_PATH: '/libraries/:libraryId/:username',
  AUDIT_USER_PATH: '/user/:username',
};

export enum RoleOperationErrorStatus {
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_HAS_ROLE = 'user_already_has_role',
  USER_DOES_NOT_HAVE_ROLE = 'user_does_not_have_role',
  ROLE_ASSIGNMENT_ERROR = 'role_assignment_error',
  ROLE_REMOVAL_ERROR = 'role_removal_error',
}

export const TABLE_DEFAULT_PAGE_SIZE = 10;
