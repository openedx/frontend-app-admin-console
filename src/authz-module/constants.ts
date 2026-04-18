export const ROUTES = {
  LIBRARIES_TEAM_PATH: '/libraries/:libraryId',
  LIBRARIES_USER_PATH: '/libraries/:libraryId/:username',

};

export enum RoleOperationErrorStatus {
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_HAS_ROLE = 'user_already_has_role',
  USER_DOES_NOT_HAVE_ROLE = 'user_does_not_have_role',
  ROLE_ASSIGNMENT_ERROR = 'role_assignment_error',
  ROLE_REMOVAL_ERROR = 'role_removal_error',
}

export const MAX_TABLE_FILTERS_APPLIED = 10;

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
