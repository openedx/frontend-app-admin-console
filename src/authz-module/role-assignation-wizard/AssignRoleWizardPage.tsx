import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { buildUserPath, ROUTES } from '../constants';
import messages from './messages';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, courseRolesMetadata, libraryRolesMetadata,
  MANAGE_TEAM_PERMISSIONS,
} from '../roles-permissions';
import { useCourseAuthoringFlag } from '../hooks/useCourseAuthoringFlag';

const AssignRoleWizardPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUsers = searchParams.get('users') || '';
  const raw = searchParams.get('from') ?? '';
  const returnTo = (raw.startsWith('/') && !raw.startsWith('//')) ? raw : ROUTES.HOME_PATH;

  const presetUser = initialUsers.trim();
  const destination = (presetUser && !presetUser.includes(','))
    ? buildUserPath(presetUser)
    : returnTo;

  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();

  const rolesAssignable = managePermissions?.flatMap((p) => {
    if (!p.allowed) { return []; }
    if (p.action === CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM) { return libraryRolesMetadata; }
    if (p.action === CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM) {
      // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
      return isCourseAuthoringEnabled ? courseRolesMetadata : [];
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
