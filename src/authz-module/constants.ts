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
