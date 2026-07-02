// Error codes returned by the role-assignment API. Each code has a matching
// `wizard.save.error.<code>` message in ./messages.ts.
export const ROLE_ASSIGNMENT_ERRORS = {
  USER_ALREADY_HAS_ROLE: 'user_already_has_role',
  USER_NOT_FOUND: 'user_not_found',
  ROLE_ASSIGNMENT_ERROR: 'role_assignment_error',
} as const;
