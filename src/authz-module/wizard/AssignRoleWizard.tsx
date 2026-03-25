import {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import {
  Stepper, Button, Container, StatefulButton, Icon,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import SelectUsersAndRoleStep from './SelectUsersAndRoleStep';
import DefineApplicationScopeStep from './DefineApplicationScopeStep';
import { useValidateUsers, useAssignTeamMembersRole } from '../data/hooks';
import { courseRolesMetadata, libraryRolesMetadata } from '../constants';
import { useToastManager } from '../libraries-manager/ToastManagerContext';
import { useValidateUserPermissions } from '../../data/hooks';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

const CONTEXT_BY_ACTION: Record<string, string> = {
  'content_libraries.manage_library_team': 'library',
  'courses.manage_course_team': 'course',
};

const STEPS = {
  SELECT_USERS_AND_ROLE: 'select-users-and-role',
  DEFINE_APPLICATION_SCOPE: 'define-application-scope',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

interface AssignRoleWizardProps {
  onClose: () => void;
  scope: string;
}

const AssignRoleWizard = ({ onClose, scope }: AssignRoleWizardProps) => {
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.SELECT_USERS_AND_ROLE);
  const [users, setUsers] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const [validationError, setValidationError] = useState<string | null>(null);
  const [invalidUsers, setInvalidUsers] = useState<string[]>([]);

  const validateUsersMutation = useValidateUsers();
  const assignRoleMutation = useAssignTeamMembersRole();
  const { showToast, showErrorToast } = useToastManager();

  // Filter role groups based on what the current user is allowed to manage
  const permissionChecks = useMemo(() => [
    { action: 'content_libraries.manage_library_team', scope },
    { action: 'courses.manage_course_team', scope },
  ], [scope]);

  const { data: permissionsData } = useValidateUserPermissions(permissionChecks);

  // Clear highlights as soon as the user edits the input
  useEffect(() => {
    if (invalidUsers.length > 0) {
      setInvalidUsers([]);
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRoles = useMemo(() => {
    const allowedContextTypes = new Set(
      permissionsData
        .filter((p) => p.allowed)
        .map((p) => CONTEXT_BY_ACTION[p.action])
        .filter(Boolean),
    );
    return allRolesMetadata.filter((r) => allowedContextTypes.has(r.contextType || ''));
  }, [permissionsData]);

  const handleClose = () => {
    setActiveStep(STEPS.SELECT_USERS_AND_ROLE);
    setUsers('');
    setSelectedRole(null);
    setSelectedScopes(new Set());
    setValidationError(null);
    setInvalidUsers([]);
    onClose();
  };

  const parseUsers = (input: string): string[] => input
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  const validateUsersAndProceed = async () => {
    const usersList = parseUsers(users);
    if (usersList.length === 0 || !selectedRole) { return; }

    setValidationError(null);
    setInvalidUsers([]);

    try {
      const result = await validateUsersMutation.mutateAsync({ data: { users: usersList } });
      if (result.invalidUsers?.length > 0) {
        setInvalidUsers(result.invalidUsers);
      } else {
        setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE);
      }
    } catch {
      setValidationError('An error occurred while validating users. Please try again.');
    }
  };

  const handleScopeToggle = useCallback((scopeId: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeId)) { next.delete(scopeId); } else { next.add(scopeId); }
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!selectedRole || selectedScopes.size === 0) { return; }
    const usersList = parseUsers(users);

    try {
      await Promise.all(
        Array.from(selectedScopes).map((selectedScope) => assignRoleMutation.mutateAsync({
          data: { users: usersList, role: selectedRole, scope: selectedScope },
        })),
      );
      showToast({ message: 'Role assigned successfully.', type: 'success', delay: 5000 });
      handleClose();
    } catch (error: any) {
      showErrorToast(error, handleSave);
    }
  };

  const canProceed = users.trim() && selectedRole && !validateUsersMutation.isPending;
  const canSave = selectedScopes.size > 0 && !assignRoleMutation.isPending;

  return (
    <Stepper activeKey={activeStep}>
      <Stepper.Header className="bg-info-100" />

      <Container className="p-5">
        <Stepper.Step
          onClick={() => setActiveStep(STEPS.SELECT_USERS_AND_ROLE)}
          eventKey={STEPS.SELECT_USERS_AND_ROLE}
          title="Who and Role"
        >
          <SelectUsersAndRoleStep
            users={users}
            setUsers={setUsers}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            roles={filteredRoles}
            validationError={validationError}
            invalidUsers={invalidUsers}
          />
        </Stepper.Step>

        <Stepper.Step
          onClick={() => setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE)}
          eventKey={STEPS.DEFINE_APPLICATION_SCOPE}
          title="Where it applies"
        >
          <DefineApplicationScopeStep
            selectedRole={selectedRole}
            selectedScopes={selectedScopes}
            onScopeToggle={handleScopeToggle}
          />
        </Stepper.Step>
      </Container>

      <div className="p-5">
        <Stepper.ActionRow eventKey={STEPS.SELECT_USERS_AND_ROLE}>
          <Button variant="outline-primary" onClick={handleClose}>
            Cancel
          </Button>
          <Stepper.ActionRow.Spacer />
          <StatefulButton
            labels={{ default: 'Next', pending: 'Validating...' }}
            icons={{ pending: <Icon src={SpinnerSimple} /> }}
            state={validateUsersMutation.isPending ? 'pending' : 'default'}
            onClick={validateUsersAndProceed}
            disabled={!canProceed || validateUsersMutation.isPending}
          />
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey={STEPS.DEFINE_APPLICATION_SCOPE}>
          <Button variant="outline-primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="tertiary" onClick={() => setActiveStep(STEPS.SELECT_USERS_AND_ROLE)}>
            Back
          </Button>
          <Stepper.ActionRow.Spacer />
          <StatefulButton
            labels={{ default: 'Save', pending: 'Saving...' }}
            icons={{ pending: <Icon src={SpinnerSimple} /> }}
            state={assignRoleMutation.isPending ? 'pending' : 'default'}
            onClick={handleSave}
            disabled={!canSave}
          />
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};

export default AssignRoleWizard;
