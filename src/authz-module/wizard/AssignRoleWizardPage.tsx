import { useNavigate, useSearchParams } from 'react-router-dom';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { useLibrary } from '../data/hooks';
import { ROUTES } from '../constants';

const AssignRoleWizardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope') || '';
  const initialUsers = searchParams.get('users') || '';

  const { data: library, isLoading } = useLibrary(scope);

  if (isLoading) { return null; }

  const teamMembersPath = `/authz${ROUTES.LIBRARIES_TEAM_PATH.replace(':libraryId', scope)}`;

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <AuthZLayout
      context={{ id: scope, title: library.title, org: library.org }}
      navLinks={[{ label: 'Roles and Permissions Management', to: teamMembersPath }]}
      activeLabel="Assign Role"
      pageTitle="Assign Role"
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
