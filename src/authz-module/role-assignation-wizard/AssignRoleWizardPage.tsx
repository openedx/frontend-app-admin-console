import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { ROUTES } from '../constants';
import messages from './messages';

const AssignRoleWizardPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUsers = searchParams.get('users') || '';
  const raw = searchParams.get('from') ?? '';
  const returnTo = (raw.startsWith('/') && !raw.startsWith('//')) ? raw : ROUTES.HOME_PATH;

  return (
    <AuthZLayout
      context={{ id: '', title: '', org: '' }}
      navLinks={[{ label: intl.formatMessage(messages['wizard.page.breadcrumb']), to: returnTo }]}
      activeLabel={intl.formatMessage(messages['wizard.page.title'])}
      pageTitle={intl.formatMessage(messages['wizard.page.title'])}
      pageSubtitle=""
      actions={[]}
    >
      {/* TODO: pass a filtered `roles` prop once the permission-lookup API is available,
          so the wizard only shows role groups the current user can assign. */}
      <AssignRoleWizard
        onClose={() => navigate(returnTo)}
        initialUsers={initialUsers}
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
