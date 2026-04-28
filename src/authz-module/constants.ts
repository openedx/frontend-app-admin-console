import { PermissionMetadata, ResourceMetadata } from 'types';
import {
  School, LibraryBooks, Article, Group, LocalOffer,
  BookOpen,
  Sync,
  Folder,
  Calendar,
  Download,
  DrawShapes,
  CheckCircle,
  RemoveRedEye,
  Plus,
  EditOutline,
  DownloadDone,
  Settings,
  Checklist,
  Delete,
  Upload,
} from '@openedx/paragon/icons';

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

const ORG_AGGREGATE_SCOPE_BUILDERS = {
  course: (orgSlug: string) => `course-v1:${orgSlug}+*`,
  library: (orgSlug: string) => `lib:${orgSlug}:*`,
};

export const getOrgAggregateScopeKey = (contextType: string, orgSlug: string): string => {
  const builder = ORG_AGGREGATE_SCOPE_BUILDERS[contextType];
  if (!builder) { throw new Error(`Unknown contextType: "${contextType}"`); }
  return builder(orgSlug);
};

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

export const courseResourceTypes: ResourceMetadata[] = [
  {
    key: 'course_tags_taxonomies', label: 'Tags & taxonomies', description: 'Permissions for managing tags and taxonomies used to organize course content.', icon: LocalOffer,
  },
  {
    key: 'course_updates_handouts', label: 'Course updates & handouts', description: 'Permissions for viewing and managing course updates and handouts that are visible to learners.', icon: Sync,
  },
  {
    key: 'course_advanced_certificates', label: 'Advanced & certificates', description: 'Permissions for managing advanced course settings and course certificates.', icon: CheckCircle,
  },
  {
    key: 'course_access_content', label: 'Course Access & content', description: 'Permissions related to accessing the course and managing core course content, including creating, editing, and publishing materials.', icon: BookOpen,
  },
  {
    key: 'course_files', label: 'Files', description: 'Permissions for viewing and managing course pages and additional learning resources.', icon: Folder,
  },
  {
    key: 'course_schedule_details', label: 'Schedule & details', description: 'Permissions for viewing and editing the course schedule and course information.', icon: Calendar,
  },
  {
    key: 'course_library_updates', label: 'Library updates', description: 'Permissions for reviewing and managing updates made to content libraries connected to the course.', icon: LibraryBooks,
  },
  {
    key: 'course_grading', label: 'Grading', description: 'Permissions related to viewing and managing grading configuration and grading policies.', icon: School,
  },
  {
    key: 'course_pages_resources', label: 'Pages & resources', description: 'Permissions for viewing and managing course pages and additional learning resources.', icon: Article,
  },

  {
    key: 'course_other', label: 'Other', description: 'Additional permissions not included in other categories, such as viewing checklists and platform-level course roles.', icon: DrawShapes,
  },
  {
    key: 'course_import_export', label: 'Import / export', description: 'Permissions for importing and exporting course content and related data.', icon: Download,
  },
  {
    key: 'course_team_group', label: 'Course team & groups', description: 'Permissions for viewing and managing the course team, learner groups, and group configurations.', icon: Group,
  },
];

export const coursePermissions: PermissionMetadata[] = [
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
    resource: 'course_access_content',
    description: 'View course: See the course in the Studio home and access the course outline in read-only mode. Includes the "View Live" option to preview the course as a learner in the LMS.',
    label: 'View course',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.CREATE_COURSE,
    resource: 'course_access_content',
    description: 'Create a new course in Studio.',
    label: 'Create course',
    icon: Plus,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.PUBLISH_COURSE_CONTENT,
    resource: 'course_access_content',
    description: 'Publish course content.',
    label: 'Publish content',
    icon: DownloadDone,

  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
    resource: 'course_access_content',
    description: 'Edit the course outline, units, and components.',
    label: 'Edit content',
    icon: EditOutline,

  },
  {
    key: CONTENT_COURSE_PERMISSIONS.REVIEW_COURSE_LIBRARY_UPDATES,
    resource: 'course_library_updates',
    description: 'Accept or reject pending updates from content libraries linked to this course.',
    label: 'Review library updates',
    icon: Checklist,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
    resource: 'course_updates_handouts',
    description: 'See course announcements and handouts visible to learners.',
    label: 'View updates',
    icon: RemoveRedEye,

  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
    resource: 'course_updates_handouts',
    description: 'Create, edit, and delete course announcements and handouts.',
    label: 'Manage course updates',
    icon: Settings,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
    resource: 'course_pages_resources',
    description: 'See the Pages & Resources section in Studio.',
    label: 'View pages and resources',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_PAGES_RESOURCES,
    resource: 'course_pages_resources',
    description: 'Enable or disable course features such as Discussions, the Wiki, Notes, Calculator, and Live. Create and edit Textbooks and Custom pages, and manage their configurations.',
    label: 'Manage pages & resources',
    icon: EditOutline,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
    resource: 'course_files',
    description: 'See the list of files and assets uploaded to the course.',
    label: 'View files',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.CREATE_COURSE_FILES,
    resource: 'course_files',
    description: 'Upload new files and assets to the course.',
    label: 'Create files',
    icon: Plus,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_FILES,
    resource: 'course_files',
    description: 'Permanently remove files and assets from the course.',
    label: 'Edit files',
    icon: EditOutline,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.DELETE_COURSE_FILES,
    resource: 'course_files',
    description: 'Delete files.',
    label: 'Delete files',
    icon: Delete,

  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
    resource: 'course_schedule_details',
    description: 'See the course start and end dates, enrollment dates, and pacing settings.',
    label: 'View schedule',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_SCHEDULE,
    resource: 'course_schedule_details',
    description: 'Update course start and end dates, enrollment dates, and pacing settings.',
    label: 'Edit schedule',
    icon: EditOutline,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
    resource: 'course_schedule_details',
    description: 'See course information including the course summary, pacing, and prerequisites.',
    label: 'View details',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_DETAILS,
    resource: 'course_schedule_details',
    description: 'Update course information including the course summary, pacing, and prerequisites.',
    label: 'Edit details',
    icon: EditOutline,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
    resource: 'course_grading',
    description: 'See the grading configuration for the course, including assignment types and grading scale.',
    label: 'View grading',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_GRADING_SETTINGS,
    resource: 'course_grading',
    description: 'Update the grading configuration for the course, including assignment types and grading scale.',
    label: 'Edit grading settings',
    icon: EditOutline,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
    resource: 'course_team_group',
    description: 'See the list of users with a role assigned to this course.',
    label: 'View course team',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_GROUP_CONFIGURATION,
    resource: 'course_team_group',
    description: 'Create and manage content groups used to target course content to specific learners.',
    label: 'Manage group config',
    icon: Settings,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
    resource: 'course_team_group',
    description: 'Add, change, or remove role assignments for this course from the Roles and Permissions console.',
    label: 'Manage course team',
    icon: Settings,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAGS,
    resource: 'course_tags_taxonomies',
    description: 'Create, edit, and delete tags on this course.',
    label: 'Manage tags',
    icon: Settings,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAXONOMIES,
    resource: 'course_tags_taxonomies',
    description: 'Create, edit, and delete taxonomies used to organize course content.',
    label: 'Manage taxonomies',
    icon: Settings,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_ADVANCED_SETTINGS,
    resource: 'course_advanced_certificates',
    description: 'Access and edit the Advanced Settings page in Studio. This covers a wide range of technical course configurations, including proctoring, timed exams, LTI tools, enrollment limits, and custom display options.',
    label: 'Manage advanced settings',
    icon: Settings,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_CERTIFICATES,
    resource: 'course_advanced_certificates',
    description: 'Access and edit the Advanced Settings page in Studio. This covers a wide range of technical course configurations, including proctoring, timed exams, LTI tools, enrollment limits, and custom display options.',
    label: 'Manage certificates',
    icon: Settings,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.IMPORT_COURSE,
    resource: 'course_import_export',
    description: 'Import course content from a file. This is a high-privilege action that can overwrite most course content and settings.',
    label: 'Import course',
    icon: Download,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE,
    resource: 'course_import_export',
    description: 'Download the course content as a file for backup or reuse in another platform.',
    label: 'Export course',
    icon: Upload,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE_TAGS,
    resource: 'course_import_export',
    description: 'Download the tag data associated with this course.',
    label: 'Export tags',
    icon: Upload,
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
    resource: 'course_other',
    description: 'See the course launch checklist in Studio.',
    label: 'View checklists',
    icon: RemoveRedEye,
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS,
    resource: 'course_other',
    description: 'See the list of users with platform-wide roles such as Global Staff and Super Admin.',
    label: 'View global staff & super admins',
    icon: RemoveRedEye,
  },

];

export const rolesObject = [
  {
    role: 'course_admin',
    permissions: [
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
      CONTENT_COURSE_PERMISSIONS.REVIEW_COURSE_LIBRARY_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.CREATE_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_GROUP_CONFIGURATION,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAGS,
      CONTENT_COURSE_PERMISSIONS.PUBLISH_COURSE_CONTENT,
      CONTENT_COURSE_PERMISSIONS.DELETE_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_ADVANCED_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_CERTIFICATES,
      CONTENT_COURSE_PERMISSIONS.IMPORT_COURSE,
      CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE,
      CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE_TAGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAXONOMIES,
    ],
    userCount: 1,
    name: 'Course Admin',
    description: 'course level administration, including access and role management for the course team, plus all Staff capabilities.',
  },

  {
    role: 'course_staff',
    permissions: [
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
      CONTENT_COURSE_PERMISSIONS.REVIEW_COURSE_LIBRARY_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.CREATE_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_GROUP_CONFIGURATION,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAGS,
      CONTENT_COURSE_PERMISSIONS.PUBLISH_COURSE_CONTENT,
      CONTENT_COURSE_PERMISSIONS.DELETE_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_ADVANCED_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_CERTIFICATES,
      CONTENT_COURSE_PERMISSIONS.IMPORT_COURSE,
      CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE,
      CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE_TAGS,
    ],
    userCount: 1,
    name: 'Course Staff',
    description: 'operating the course lifecycle in Studio, publishing content, handling scheduling, and managing high impact configuration for the course.',
  },
  {
    role: 'course_editor',
    permissions: [
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
      CONTENT_COURSE_PERMISSIONS.REVIEW_COURSE_LIBRARY_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.CREATE_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_GROUP_CONFIGURATION,
      CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_DETAILS,
      CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAGS,
    ],
    userCount: 1,
    name: 'Course Editor',
    description: 'building and maintaining course content and supporting assets, without operational controls or high impact actions that can affect a live course.',
    disabled: true,
  },
  {
    role: 'course_auditor',
    permissions: [
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
      CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
    ],
    userCount: 1,
    name: 'Course Auditor',
    description: ' QA, compliance review, content review, and general oversight, no changes in Studio.',
    disabled: true,
  },

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
  HOME_PATH: '/authz',
  AUDIT_USER_PATH: '/user/:username',
  ASSIGN_ROLE_WIZARD_PATH: '/assign-role',
};

export const buildWizardPath = (options?: { users?: string; from?: string }) => {
  const base = `${ROUTES.HOME_PATH}${ROUTES.ASSIGN_ROLE_WIZARD_PATH}`;
  if (!options) { return base; }
  const params = new URLSearchParams();
  if (options.users) { params.set('users', options.users); }
  if (options.from) { params.set('from', options.from); }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export enum RoleOperationErrorStatus {
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_HAS_ROLE = 'user_already_has_role',
  USER_DOES_NOT_HAVE_ROLE = 'user_does_not_have_role',
  ROLE_ASSIGNMENT_ERROR = 'role_assignment_error',
  ROLE_REMOVAL_ERROR = 'role_removal_error',
}

export const MAX_TABLE_FILTERS_APPLIED = 10;

export const AUTHZ_HOME_PATH = '/authz';

export const MAP_ROLE_KEY_TO_LABEL: Record<string, string> = {
  library_admin: 'Library Admin',
  library_author: 'Library Author',
  library_contributor: 'Library Contributor',
  library_user: 'Library User',
  course_admin: 'Course Admin',
  course_staff: 'Course Staff',
  course_editor: 'Course Editor',
  course_auditor: 'Course Auditor',
  'django.superuser': 'Super Admin',
  'django.globalstaff': 'Global Staff',
};

export const DJANGO_MANAGED_ROLES = ['django.superuser', 'django.globalstaff'];

export const TABLE_DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_FILTER_PAGE_SIZE = 5;
export const ADMIN_ROLES = ['course_admin', 'library_admin'];

// Resource Type Definitions
export const RESOURCE_TYPES = {
  LIBRARY: 'library',
  COURSE: 'course',
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
