import {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Stepper, Button, StatefulButton, Icon,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import { RoleMetadata } from 'types';
import { useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import SelectUsersAndRoleStep from './components/SelectUsersAndRoleStep';
import DefineApplicationScopeStep from './components/DefineApplicationScopeStep';
import { libraryRolesMetadata } from '../roles-permissions/library/constants';
import { courseRolesMetadata } from '../roles-permissions/course/constants';
import { useValidateUsers, useAssignTeamMembersRole } from '../data/hooks';
import messages from './messages';
import { formatRoleAssignmentError } from './utils';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

const STEPS = {
  SELECT_USERS_AND_ROLE: 'select-users-and-role',
  DEFINE_APPLICATION_SCOPE: 'define-application-scope',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

interface AssignRoleWizardProps {
  onClose: () => void;
  initialUsers?: string;
  /** Filtered role list. Defaults to all roles (course + library). Pass a subset
   *  once a permission-lookup API is available to hide groups the caller cannot assign. */
  roles?: RoleMetadata[];
}

const parseUsers = (input: string): string[] => input
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const getInitialState = (initialUsers: string) => ({
  activeStep: STEPS.SELECT_USERS_AND_ROLE as StepKey,
  users: initialUsers,
  selectedRole: null as string | null,
  selectedScopes: new Set<string>(),
  invalidUsers: [] as string[],
  validatedUsers: [] as string[],
});

const AssignRoleWizard = ({ onClose, initialUsers = '', roles = allRolesMetadata }: AssignRoleWizardProps) => {
  const intl = useIntl();
  const { showToast, showErrorToast } = useToastManager();
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.SELECT_USERS_AND_ROLE);
  const [users, setUsers] = useState(initialUsers);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const [invalidUsers, setInvalidUsers] = useState<string[]>([]);
  const [validatedUsers, setValidatedUsers] = useState<string[]>([]);

  const usersInputRef = useRef<HTMLTextAreaElement>(null);

  const validateUsersMutation = useValidateUsers();
  const assignRoleMutation = useAssignTeamMembersRole();

  const handleUsersChange = useCallback((value: string) => {
    setInvalidUsers((prev) => (prev.length > 0 ? [] : prev));
    setUsers(value);
  }, []);

  const handleClose = () => {
    const initialState = getInitialState(initialUsers);
    setActiveStep(initialState.activeStep);
    setUsers(initialState.users);
    setSelectedRole(initialState.selectedRole);
    setSelectedScopes(initialState.selectedScopes);
    setInvalidUsers(initialState.invalidUsers);
    setValidatedUsers(initialState.validatedUsers);
    onClose();
  };

  const validateUsersAndProceed = async () => {
    if (validateUsersMutation.isPending) { return; }
    const usersList = parseUsers(users);
    if (usersList.length === 0 || !selectedRole) { return; }

    setInvalidUsers([]);

    try {
      const result = await validateUsersMutation.mutateAsync({ data: { users: usersList } });
      if (result.invalidUsers?.length > 0) {
        setInvalidUsers(result.invalidUsers);
      } else {
        setValidatedUsers(usersList);
        setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE);
      }
    } catch (error) {
      showErrorToast(error, validateUsersAndProceed);
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
    if (!selectedRole || selectedScopes.size === 0 || validatedUsers.length === 0) { return; }

    try {
      const result = await assignRoleMutation.mutateAsync({
        data: {
          users: validatedUsers,
          role: selectedRole,
          scopes: Array.from(selectedScopes),
        },
      });

      if (result.errors?.length > 0) {
        const lines = result.errors.map((e) => formatRoleAssignmentError(intl, e));
        showToast({ message: lines.join(' · '), type: 'error' });
      } else {
        showToast({
          message: intl.formatMessage(messages['wizard.save.success']),
          type: 'success',
        });
        handleClose();
      }
    } catch (error) {
      showErrorToast(error, handleSave);
    }
  };

  useEffect(() => {
    if (invalidUsers.length && usersInputRef.current) {
      usersInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [invalidUsers]);

  const parsedUsers = parseUsers(users);
  const canProceed = parsedUsers.length > 0 && !!selectedRole;
  const canSave = selectedScopes.size > 0;

  return (
    <Stepper activeKey={activeStep}>
      <Stepper.Header className="bg-info-100" />

      <div className="bg-light-200 p-5">
        <Stepper.Step
          eventKey={STEPS.SELECT_USERS_AND_ROLE}
          title={intl.formatMessage(messages['wizard.step.selectUsersAndRole.title'])}
          hasError={invalidUsers.length > 0}
          description={invalidUsers.length > 0 ? intl.formatMessage(messages['wizard.step.selectUsersAndRole.error']) : ''}
          index={0}
        >
          <SelectUsersAndRoleStep
            users={users}
            setUsers={handleUsersChange}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            roles={roles}
            invalidUsers={invalidUsers}
            inputRef={usersInputRef}
          />
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPS.DEFINE_APPLICATION_SCOPE}
          title={intl.formatMessage(messages['wizard.step.defineScope.title'])}
          index={1}
        >
          <DefineApplicationScopeStep
            selectedRole={selectedRole}
            selectedScopes={selectedScopes}
            onScopeToggle={handleScopeToggle}
          />
        </Stepper.Step>
      </div>

      <div className="p-5">
        <Stepper.ActionRow eventKey={STEPS.SELECT_USERS_AND_ROLE}>
          <Button variant="outline-primary" onClick={handleClose}>
            {intl.formatMessage(messages['wizard.button.cancel'])}
          </Button>
          <Stepper.ActionRow.Spacer />
          <StatefulButton
            labels={{
              default: intl.formatMessage(messages['wizard.button.next']),
              pending: intl.formatMessage(messages['wizard.button.next.pending']),
            }}
            icons={{ pending: <Icon src={SpinnerSimple} /> }}
            variant={invalidUsers.length ? 'danger' : 'primary'}
            state={validateUsersMutation.isPending ? 'pending' : 'default'}
            onClick={validateUsersAndProceed}
            disabled={!canProceed || validateUsersMutation.isPending}
          />
        </Stepper.ActionRow>

        <Stepper.ActionRow eventKey={STEPS.DEFINE_APPLICATION_SCOPE}>
          <Button variant="outline-primary" onClick={handleClose}>
            {intl.formatMessage(messages['wizard.button.cancel'])}
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setSelectedScopes(new Set());
              setActiveStep(STEPS.SELECT_USERS_AND_ROLE);
            }}
          >
            {intl.formatMessage(messages['wizard.button.back'])}
          </Button>
          <Stepper.ActionRow.Spacer />
          <StatefulButton
            labels={{
              default: intl.formatMessage(messages['wizard.button.save']),
              pending: intl.formatMessage(messages['wizard.button.save.pending']),
            }}
            icons={{ pending: <Icon src={SpinnerSimple} /> }}
            state={assignRoleMutation.isPending ? 'pending' : 'default'}
            onClick={handleSave}
            disabled={!canSave || assignRoleMutation.isPending}
          />
        </Stepper.ActionRow>
      </div>
    </Stepper>
  );
};

export default AssignRoleWizard;
