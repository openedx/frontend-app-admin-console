import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { ROUTES } from '../constants';
import messages from './messages';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, courseRolesMetadata, libraryRolesMetadata,
  MANAGE_TEAM_PERMISSIONS, VIEW_TEAM_PERMISSIONS,
} from '../roles-permissions';

const AssignRoleWizardPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUsers = searchParams.get('users') || '';
  const raw = searchParams.get('from') ?? '';
  const returnTo = (raw.startsWith('/') && !raw.startsWith('//')) ? raw : ROUTES.HOME_PATH;

  const presetUser = initialUsers.trim();
  const destination = (presetUser && !presetUser.includes(','))
    ? `${ROUTES.HOME_PATH}/user/${presetUser}`
    : returnTo;

  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { data: viewPermissions } = useValidateUserPermissionsNonSuspense(VIEW_TEAM_PERMISSIONS);

  const isCourseViewAllowed = viewPermissions
    ? viewPermissions.some((p) => p.action === CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM && p.allowed)
    : true;

  const rolesAssignable = managePermissions?.flatMap((p) => {
    if (!p.allowed) { return []; }
    if (p.action === CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM) { return libraryRolesMetadata; }
    if (p.action === CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM) {
      return isCourseViewAllowed ? courseRolesMetadata : [];
    }
    return [];
  });

  return (
    <AuthZLayout
      context={{ id: '', title: '', org: '' }}
      navLinks={[{ label: intl.formatMessage(messages['wizard.page.breadcrumb']), to: returnTo }]}
      activeLabel={intl.formatMessage(messages['wizard.page.title'])}
      pageTitle={intl.formatMessage(messages['wizard.page.title'])}
      pageSubtitle=""
      actions={[]}
    >
      <AssignRoleWizard
        onClose={() => navigate(destination)}
        initialUsers={initialUsers}
        roles={rolesAssignable}
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
