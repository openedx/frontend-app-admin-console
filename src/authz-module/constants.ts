export const ROUTES = {
  LIBRARIES_TEAM_PATH: '/libraries/:libraryId',
  LIBRARIES_USER_PATH: '/libraries/:libraryId/:username',
  ASSIGN_ROLE_WIZARD_PATH: '/assign-role',
};

export enum RoleOperationErrorStatus {
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_HAS_ROLE = 'user_already_has_role',
  USER_DOES_NOT_HAVE_ROLE = 'user_does_not_have_role',
  ROLE_ASSIGNMENT_ERROR = 'role_assignment_error',
  ROLE_REMOVAL_ERROR = 'role_removal_error',
}

// Content Library Permission Keys
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

// Note: this information will eventually come from the backend API
// but for the MVP we decided to manage it in the frontend
export const libraryRolesMetadata = [
  {
    role: 'library_admin', name: 'Library Admin', description: 'Can create and manage content libraries, including access and structure.', contextType: 'library',
  },
  {
    role: 'library_author', name: 'Library Author', description: 'Can create and edit library content, but cannot manage access.', contextType: 'library',
  },
  {
    role: 'library_contributor', name: 'Library Contributor', description: 'Can contribute and update library content shared with them.', contextType: 'library',
  },
  {
    role: 'library_user', name: 'Library User', description: 'Can view and use library content, but cannot edit it.', contextType: 'library',
  },
];

export const libraryResourceTypes = [
  { key: 'library', label: 'Library', description: 'Permissions related to the library as a whole.' },
  { key: 'library_content', label: 'Content', description: 'Permissions to create, edit, delete, and publish individual content items within the library.' },
  { key: 'library_collection', label: 'Collection', description: 'Permissions to create, edit, and delete content collections within the library.' },
  { key: 'library_team', label: 'Team', description: 'Permissions to manage user access and roles within the library.' },
];

export const libraryPermissions = [
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

// Course Permission Keys
export const COURSE_PERMISSIONS = {
  // View permissions (Course Auditor)
  VIEW_COURSE: 'courses.view_course',
  VIEW_COURSE_UPDATES: 'courses.view_course_updates',
  VIEW_PAGES_AND_RESOURCES: 'courses.view_pages_and_resources',
  VIEW_FILES: 'courses.view_files',
  VIEW_GRADING_SETTINGS: 'courses.view_grading_settings',
  VIEW_CHECKLISTS: 'courses.view_checklists',
  VIEW_COURSE_TEAM: 'courses.view_course_team',
  VIEW_SCHEDULE_AND_DETAILS: 'courses.view_schedule_and_details',

  // Edit permissions (Course Editor)
  EDIT_COURSE_CONTENT: 'courses.edit_course_content',
  MANAGE_LIBRARY_UPDATES: 'courses.manage_library_updates',
  MANAGE_COURSE_UPDATES: 'courses.manage_course_updates',
  MANAGE_PAGES_AND_RESOURCES: 'courses.manage_pages_and_resources',
  CREATE_FILES: 'courses.create_files',
  EDIT_FILES: 'courses.edit_files',
  EDIT_GRADING_SETTINGS: 'courses.edit_grading_settings',
  MANAGE_GROUP_CONFIGURATIONS: 'courses.manage_group_configurations',
  EDIT_DETAILS: 'courses.edit_details',
  MANAGE_TAGS: 'courses.manage_tags',

  // Publish & lifecycle permissions (Course Staff)
  PUBLISH_COURSE_CONTENT: 'courses.publish_course_content',
  DELETE_FILES: 'courses.delete_files',
  EDIT_SCHEDULE: 'courses.edit_schedule',
  MANAGE_ADVANCED_SETTINGS: 'courses.manage_advanced_settings',
  MANAGE_CERTIFICATES: 'courses.manage_certificates',
  IMPORT_COURSE: 'courses.import_course',
  EXPORT_COURSE: 'courses.export_course',
  EXPORT_TAGS: 'courses.export_tags',

  // Team & taxonomy permissions (Course Admin only)
  MANAGE_COURSE_TEAM: 'courses.manage_course_team',
  MANAGE_TAXONOMIES: 'courses.manage_taxonomies',

  // Legacy role permissions
  LEGACY_STAFF_ROLE_PERMISSIONS: 'courses.legacy_staff_role_permissions',
  LEGACY_INSTRUCTOR_ROLE_PERMISSIONS: 'courses.legacy_instructor_role_permissions',
  LEGACY_LIMITED_STAFF_ROLE_PERMISSIONS: 'courses.legacy_limited_staff_role_permissions',
  LEGACY_DATA_RESEARCHER_PERMISSIONS: 'courses.legacy_data_researcher_permissions',
  LEGACY_BETA_TESTER_PERMISSIONS: 'courses.legacy_beta_tester_permissions',
};

// Resource Type Definitions
export const RESOURCE_TYPES = {
  LIBRARY: 'library',
  COURSE: 'course',
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];

export const courseRolesMetadata = [
  {
    role: 'course_admin', name: 'Course Admin', description: 'Can manage the course team and all course settings.', contextType: 'course',
  },
  {
    role: 'course_staff', name: 'Course Staff', description: 'Can publish content and manage the course lifecycle in Studio.', contextType: 'course',
  },
  {
    role: 'course_editor', name: 'Course Editor', description: 'Can create and edit course content, but cannot publish or change critical course settings.', contextType: 'course', disabled: true,
  },
  {
    role: 'course_auditor', name: 'Course Auditor', description: 'Can view course content and settings, but cannot make changes.', contextType: 'course', disabled: true,
  },
];

// Get roles metadata by resource type
export const getRolesMetadata = (resourceType: ResourceType) => {
  switch (resourceType) {
    case RESOURCE_TYPES.LIBRARY:
      return libraryRolesMetadata;
    case RESOURCE_TYPES.COURSE:
      return courseRolesMetadata;
    default:
      return [];
  }
};

// Get permissions by resource type
export const getPermissions = (resourceType: ResourceType) => {
  switch (resourceType) {
    case RESOURCE_TYPES.LIBRARY:
      return libraryPermissions;
    default:
      return [];
  }
};

// Get resource types by resource type
export const getResourceTypes = (resourceType: ResourceType) => {
  switch (resourceType) {
    case RESOURCE_TYPES.LIBRARY:
      return libraryResourceTypes;
    default:
      return [];
  }
};
