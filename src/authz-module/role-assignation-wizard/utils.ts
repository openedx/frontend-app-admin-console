import type { IntlShape } from '@openedx/frontend-base';
import { PutAssignTeamMembersRoleResponse } from '@src/authz-module/data/api';
import { ROLE_ASSIGNMENT_ERRORS } from './constants';
import messages from './messages';

type RoleAssignmentError = PutAssignTeamMembersRoleResponse['errors'][number];

/**
 * A save the API accepted but only partly applied.
 *
 * `completedCount` travels with the lines because it cannot be recovered from them: the
 * failures say nothing about the assignments that went through, and that is what tells
 * the admin whether to fix only the users listed here or to save again for everyone.
 */
export interface AssignmentFailure {
  /** Per-user failures, already formatted for display. One line per user/scope pair. */
  errors: string[];
  /** User/scope pairs the same save did assign. Zero means nothing was assigned. */
  completedCount: number;
}

export const formatRoleAssignmentError = (
  intl: IntlShape,
  e: RoleAssignmentError,
): string => {
  const params = { userIdentifier: e.userIdentifier, scope: e.scope };
  if (e.error === ROLE_ASSIGNMENT_ERRORS.USER_ALREADY_HAS_ROLE) {
    return intl.formatMessage(messages['wizard.save.error.user_already_has_role'], params);
  }
  if (e.error === ROLE_ASSIGNMENT_ERRORS.USER_NOT_FOUND) {
    return intl.formatMessage(messages['wizard.save.error.user_not_found'], params);
  }
  if (e.error === ROLE_ASSIGNMENT_ERRORS.ROLE_ASSIGNMENT_ERROR) {
    return intl.formatMessage(messages['wizard.save.error.role_assignment_error'], params);
  }
  return intl.formatMessage(messages['wizard.save.error.default'], { ...params, error: e.error });
};
