import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import { AUTHZ_HOME_PATH, buildAuditUserPath, SCOPE_TYPES } from '@src/authz-module/constants';
import messages from './messages';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, MANAGE_TEAM_PERMISSIONS,
} from '@src/authz-module/roles-permissions';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';

// Permission that lets the user assign the roles of each scope type.
const MANAGE_TEAM_ACTIONS: Partial<Record<string, string>> = {
  [SCOPE_TYPES.COURSE]: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
  [SCOPE_TYPES.LIBRARY]: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
};

const AssignRoleWizardPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUsers = searchParams.get('users') || '';
  const raw = searchParams.get('from') ?? '';
  const returnTo = (raw.startsWith('/') && !raw.startsWith('//')) ? raw : AUTHZ_HOME_PATH;

  const presetUser = initialUsers.trim();
  const destination = (presetUser && !presetUser.includes(','))
    ? buildAuditUserPath(presetUser)
    : returnTo;

  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();
  const { scopeTypes, getScopeCatalog } = useAuthzCatalog();

  // The catalog roles of the scope types where the user can manage the team, in catalog order.
  const roleGroups = scopeTypes
    .filter((scopeType) => managePermissions?.some(
      ({ action, allowed }) => allowed && action === MANAGE_TEAM_ACTIONS[scopeType],
    ))
    // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
    .filter((scopeType) => scopeType !== SCOPE_TYPES.COURSE || isCourseAuthoringEnabled)
    .map(getScopeCatalog)
    .filter((scopeCatalog) => scopeCatalog !== undefined);

  return (
    <AuthZLayout
      navLinks={[{ label: intl.formatMessage(messages['wizard.page.breadcrumb']), to: returnTo }]}
      activeLabel={intl.formatMessage(messages['wizard.page.title'])}
      pageTitle={intl.formatMessage(messages['wizard.page.title'])}
      actions={[]}
    >
      <AssignRoleWizard
        onClose={() => navigate(destination)}
        initialUsers={initialUsers}
        roleGroups={roleGroups}
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
