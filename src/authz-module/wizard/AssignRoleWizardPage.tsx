import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { useLibrary } from '../data/hooks';
import { ROUTES } from '../constants';
import messages from './messages';

const AssignRoleWizardPage = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope') || '';
  const initialUsers = searchParams.get('users') || '';

  const { data: library } = useLibrary(scope);

  if (!scope || !library) { return null; }

  const teamMembersPath = `/authz${ROUTES.LIBRARIES_TEAM_PATH.replace(':libraryId', scope)}`;

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <AuthZLayout
      context={{ id: scope, title: library.title, org: library.org }}
      navLinks={[{ label: intl.formatMessage(messages['wizard.page.breadcrumb']), to: teamMembersPath }]}
      activeLabel={intl.formatMessage(messages['wizard.page.title'])}
      pageTitle={intl.formatMessage(messages['wizard.page.title'])}
      pageSubtitle=""
      actions={[]}
    >
      <AssignRoleWizard
        onClose={handleCancel}
        scope={scope}
        initialUsers={initialUsers}
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
