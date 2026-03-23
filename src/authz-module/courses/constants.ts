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
} from '@openedx/paragon/icons';

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

export const courseResourceTypes: ResourceMetadata[] = [
  { key: 'course_access_content', label: 'Course Access & content', description: 'Permissions related to accessing the course and managing core course content, including creating, editing, and publishing materials.', icon: BookOpen },
  { key: 'course_library_updates', label: 'Library updates', description: 'Permissions for reviewing and managing updates made to content libraries connected to the course.', icon: LibraryBooks },
  { key: 'course_updates_handouts', label: 'Course updates & handouts', description: 'Permissions for viewing and managing course updates and handouts that are visible to learners.', icon: Sync },
  { key: 'course_pages_resources', label: 'Pages & resources', description: 'Permissions for viewing and managing course pages and additional learning resources.', icon: Article },
  { key: 'course_files', label: 'Files', description: 'Permissions for viewing and managing course pages and additional learning resources.', icon: Folder },
  { key: 'course_schedule_details', label: 'Schedule & details', description: 'Permissions for viewing and editing the course schedule and course information.', icon: Calendar },
  { key: 'course_grading', label: 'Grading', description: 'Permissions related to viewing and managing grading configuration and grading policies.', icon: School },
  { key: 'course_team_group', label: 'Course team & groups', description: 'Permissions for viewing and managing the course team, learner groups, and group configurations.', icon: Group },
  { key: 'course_tags_taxonomies', label: 'Tags & taxonomies', description: 'Permissions for managing tags and taxonomies used to organize course content.', icon: LocalOffer },
  { key: 'course_advanced_certificates', label: 'Advanced & certificates', description: 'Permissions for managing advanced course settings and course certificates.', icon: CheckCircle },
  { key: 'course_import_export', label: 'Import / export', description: 'Permissions for importing and exporting course content and related data.', icon: Download },
  { key: 'course_other', label: 'Other', description: 'Additional permissions not included in other categories, such as viewing checklists and platform-level course roles.', icon: DrawShapes },

];

export const coursePermissions: PermissionMetadata[] = [
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE,
    resource: 'course_access_content',
    description: 'View course in the course list, access the course outline in read only mode, includes the "View Live" entry point.',
    label: 'View course',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.CREATE_COURSE,
    resource: 'course_access_content',
    description: 'Create a new course in Studio.',
    label: 'Create course',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_CONTENT,
    resource: 'course_access_content',
    description: 'Edit course content, outline, units, components.',
    label: 'Edit course content',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.PUBLISH_COURSE_CONTENT,
    resource: 'course_access_content',
    description: 'Publish course content.',
    label: 'Publish course content',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.REVIEW_COURSE_LIBRARY_UPDATES,
    resource: 'course_library_updates',
    description: 'Accept or reject library updates in Studio.',
    label: 'Review library updates',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_UPDATES,
    resource: 'course_updates_handouts',
    description: 'View course updates and handouts.',
    label: 'View course updates',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES,
    resource: 'course_updates_handouts',
    description: 'Manage course updates and handouts, create, edit, delete.',
    label: 'Manage course updates',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_PAGES_RESOURCES,
    resource: 'course_pages_resources',
    description: 'View Pages and Resources.',
    label: 'View pages & resources',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_PAGES_RESOURCES,
    resource: 'course_pages_resources',
    description: 'Edit Pages and Resources, including toggles and content managed from that section.',
    label: 'Manage pages & resources',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_FILES,
    resource: 'course_files',
    description: 'View the Files page.',
    label: 'View files',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.CREATE_COURSE_FILES,
    resource: 'course_files',
    description: 'Upload files.',
    label: 'Create files',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_FILES,
    resource: 'course_files',
    description: 'Non destructive file actions, for example lock or unlock, exact actions depend on implementation.',
    label: 'Edit files',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.DELETE_COURSE_FILES,
    resource: 'course_files',
    description: 'Delete files.',
    label: 'Delete files',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_SCHEDULE,
    resource: 'course_schedule_details',
    description: 'View course schedule.',
    label: 'View schedule',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_SCHEDULE,
    resource: 'course_schedule_details',
    description: 'Edit course schedule.',
    label: 'Edit schedule',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_DETAILS,
    resource: 'course_schedule_details',
    description: 'View course details.',
    label: 'View course details',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_DETAILS,
    resource: 'course_schedule_details',
    description: 'Edit course details, includes Course Summary, Course Pacing, Course Details, Course Pre requisite.',
    label: 'Edit course details',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GRADING_SETTINGS,
    resource: 'course_grading',
    description: 'View grading settings page.',
    label: 'View grading settings',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EDIT_COURSE_GRADING_SETTINGS,
    resource: 'course_grading',
    description: 'Edit grading settings.',
    label: 'Edit grading settings',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
    resource: 'course_team_group',
    description: 'View the course team roster.',
    label: 'View course team',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
    resource: 'course_team_group',
    description: 'Edit course team membership and roles.',
    label: 'Manage course team',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_GROUP_CONFIGURATION,
    resource: 'course_team_group',
    description: 'Manage content groups.',
    label: 'Manage group configuration',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAGS,
    resource: 'course_tags_taxonomies',
    description: 'Create, edit, delete tags.',
    label: 'Manage tags',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TAXONOMIES,
    resource: 'course_tags_taxonomies',
    description: 'Create, edit, delete taxonomies.',
    label: 'Manage taxonomies',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_ADVANCED_SETTINGS,
    resource: 'course_advanced_certificates',
    description: 'Access and edit Advanced Settings.',
    label: 'Manage advanced settings',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_CERTIFICATES,
    resource: 'course_advanced_certificates',
    description: 'Access and edit Certificates.',
    label: 'Manage certificates',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.IMPORT_COURSE,
    resource: 'course_import_export',
    description: 'Show Import in Studio, this is treated as a high privilege action and effectively implies most authoring permissions.',
    label: 'Import course',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE,
    resource: 'course_import_export',
    description: 'Show Export in Studio.',
    label: 'Export course',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.EXPORT_COURSE_TAGS,
    resource: 'course_import_export',
    description: 'Export tags.',
    label: 'Export tags',
  },

  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_CHECKLISTS,
    resource: 'course_other',
    description: 'View checklists.',
    label: 'View checklists',
  },
  {
    key: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_GLOBAL_STAFF_SUPER_ADMINS,
    resource: 'course_other',
    description: 'Allow course or library admins to view the list of global Staff and Super Admin users.',
    label: 'View global staff & super admins',
  },

];

// roles hardcoded, todo: need to add the constants from above in order to merge the different permissions array.
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
