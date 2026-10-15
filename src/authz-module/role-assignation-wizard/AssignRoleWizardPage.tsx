import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import {
  AUTHZ_HOME_PATH, buildAuditUserPath, MANAGE_TEAM_ACTIONS, MANAGE_TEAM_PERMISSIONS, SCOPE_TYPES,
} from '@src/authz-module/constants';
import messages from './messages';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';

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
  const {
    scopeTypes, getScopeCatalog, isLoading: isLoadingRoles, isError: isRolesError,
  } = useAuthzCatalog();

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
        isLoadingRoles={isLoadingRoles}
        isRolesError={isRolesError}
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
