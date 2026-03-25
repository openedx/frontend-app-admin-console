import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import AssignRoleWizard from './AssignRoleWizard';
import AuthZLayout from '../components/AuthZLayout';
import { useLibrary } from '../data/hooks';
import { ROUTES } from '../constants';

const AssignRoleWizardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scope = searchParams.get('scope') || '';

  const { data: library, isLoading, error } = useLibrary(scope);

  if (isLoading) {
    return (
      <div className="assign-role-wizard-page p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="assign-role-wizard-page p-4">
        <p>Library not found. Please go back and try again.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

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
      />
    </AuthZLayout>
  );
};

export default AssignRoleWizardPage;
