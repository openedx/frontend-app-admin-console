import { createIntl } from '@edx/frontend-platform/i18n';
import { formatRoleAssignmentError } from './utils';
import { ROLE_ASSIGNMENT_ERRORS } from './constants';

const intl = createIntl({ locale: 'en', messages: {} });
const base = { userIdentifier: 'alice', scope: 'lib:org1/lib1' };

describe('formatRoleAssignmentError', () => {
  it('formats user_already_has_role', () => {
    const result = formatRoleAssignmentError(intl, { ...base, error: ROLE_ASSIGNMENT_ERRORS.USER_ALREADY_HAS_ROLE });
    expect(result).toBe('alice already has this role in lib:org1/lib1');
  });

  it('formats user_not_found', () => {
    const result = formatRoleAssignmentError(intl, { ...base, error: ROLE_ASSIGNMENT_ERRORS.USER_NOT_FOUND });
    expect(result).toBe('User "alice" was not found');
  });

  it('formats role_assignment_error', () => {
    const result = formatRoleAssignmentError(intl, { ...base, error: ROLE_ASSIGNMENT_ERRORS.ROLE_ASSIGNMENT_ERROR });
    expect(result).toBe('Could not assign role to alice in lib:org1/lib1');
  });

  it('formats unknown error with default fallback', () => {
    const result = formatRoleAssignmentError(intl, { ...base, error: 'some_unknown_error' });
    expect(result).toBe('alice (lib:org1/lib1): some_unknown_error');
  });
});
