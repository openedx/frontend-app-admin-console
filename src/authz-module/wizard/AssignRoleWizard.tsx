import { useState } from 'react';
import {
  Stepper, Button, Container, StatefulButton,
  Icon,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import SelectUsersAndRoleStep from './SelectUsersAndRoleStep';
import DefineApplicationScopeStep from './DefineApplicationScopeStep';
import { useValidateUsers } from '../data/hooks';
import { courseRolesMetadata, libraryRolesMetadata } from '../constants';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

const STEPS = {
  SELECT_USERS_AND_ROLE: 'select-users-and-role',
  DEFINE_APPLICATION_SCOPE: 'define-application-scope',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

interface AssignRoleWizardProps {
  onClose: () => void;
}

const AssignRoleWizard = ({ onClose }: AssignRoleWizardProps) => {
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.SELECT_USERS_AND_ROLE);
  const [users, setUsers] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [invalidUsers, setInvalidUsers] = useState<string[]>([]);

  const validateUsersMutation = useValidateUsers();

  const handleClose = () => {
    setActiveStep(STEPS.SELECT_USERS_AND_ROLE);
    setUsers('');
    setSelectedRole(null);
    setValidationError(null);
    setInvalidUsers([]);
    onClose();
  };

  const parseUsers = (input: string): string[] => input
    .split(',')
    .map(u => u.trim())
    .filter(Boolean);

  const validateUsersAndProceed = async () => {
    const usersList = parseUsers(users);
    if (usersList.length === 0 || !selectedRole) {
      return;
    }

    setValidationError(null);
    setInvalidUsers([]);

    try {
      await validateUsersMutation.mutateAsync({
        data: {
          users: usersList,
        },
      });

      setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.invalidUsers) {
        setInvalidUsers(errorData.invalidUsers);
        setValidationError('Some users were not found. Please review the highlighted names below.');
      } else {
        setValidationError('An error occurred while validating users. Please try again.');
      }
    }
  };

  const canProceed = users.trim() && selectedRole && !validateUsersMutation.isPending;

  return (
    <Stepper activeKey={activeStep}>
      <Stepper.Header className="bg-info-100" />

      <Container className="p-5">
        {/* Step 1: Who and Role */}
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
            roles={allRolesMetadata}
            validationError={validationError}
            invalidUsers={invalidUsers}
          />
        </Stepper.Step>

        {/* Step 2: Where it applies */}
        <Stepper.Step
          onClick={() => setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE)}
          eventKey={STEPS.DEFINE_APPLICATION_SCOPE}
          title="Where it applies"
        >
          <DefineApplicationScopeStep
            users={users}
            selectedRole={selectedRole}
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
            labels={{
              default: 'Next',
              pending: 'Validating...',
            }}
            icons={{
			  pending: <Icon src={SpinnerSimple} />,
            }}
            state={validateUsersMutation.isPending ? 'pending' : 'default'}
            onClick={validateUsersAndProceed}
            disabled={!canProceed | validateUsersMutation.isPending}
          />
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey={STEPS.DEFINE_APPLICATION_SCOPE}>
          <Button variant="outline-primary" onClick={() => setActiveStep(STEPS.SELECT_USERS_AND_ROLE)}>
            Previous
          </Button>
          <Stepper.ActionRow.Spacer />
          <Button onClick={handleClose}>
            Apply
          </Button>
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};

export default AssignRoleWizard;
