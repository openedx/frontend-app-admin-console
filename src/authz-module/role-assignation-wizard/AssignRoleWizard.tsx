import {
  useState, useCallback, useRef, useEffect, type ReactNode,
} from 'react';
import { logError, useIntl } from '@openedx/frontend-base';
import {
  Stepper, Button, StatefulButton, Icon, FullscreenModal, Alert,
} from '@openedx/paragon';
import { SpinnerSimple } from '@openedx/paragon/icons';
import baseMessages from '@src/authz-module/messages';
import { ERROR_TOAST_MAP, useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import { getHttpErrorStatus } from '@src/data/utils';
import SelectUsersAndRoleStep from './components/SelectUsersAndRoleStep';
import type { RoleGroup, SelectedRole } from './components/SelectUsersAndRoleStep';
import DefineApplicationScopeStep from './components/DefineApplicationScopeStep';
import { useValidateUsers, useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import messages from './messages';
import { formatRoleAssignmentError, type AssignmentFailure } from './utils';

const STEPS = {
  SELECT_USERS_AND_ROLE: 'select-users-and-role',
  DEFINE_APPLICATION_SCOPE: 'define-application-scope',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

interface AssignRoleWizardProps {
  /** Shown while true; the host owns this state. */
  isOpen: boolean;
  /** Called on Cancel, header close and Esc, and after a successful save. */
  onClose: () => void;
  initialUsers?: string;
  // The roles the user can assign, grouped by scope type.
  roleGroups?: RoleGroup[];
  isLoadingRoles?: boolean;
  isRolesError?: boolean;
}

const parseUsers = (input: string): string[] => input
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const getInitialState = (initialUsers: string) => ({
  activeStep: STEPS.SELECT_USERS_AND_ROLE as StepKey,
  users: initialUsers,
  selectedRole: null as SelectedRole | null,
  selectedScopes: new Set<string>(),
  invalidUsers: [] as string[],
  validatedUsers: [] as string[],
});

/**
 * Full-screen modal, so assigning never navigates away. `Stepper` wraps it because its
 * header, steps and action rows go into three modal slots that share one context.
 */
const AssignRoleWizard = ({
  isOpen, onClose, initialUsers = '', roleGroups = [], isLoadingRoles = false, isRolesError = false,
}: AssignRoleWizardProps) => {
  const intl = useIntl();
  const { showToast, Bold, Br } = useToastManager();
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.SELECT_USERS_AND_ROLE);
  const [users, setUsers] = useState(initialUsers);
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const [invalidUsers, setInvalidUsers] = useState<string[]>([]);
  const [validatedUsers, setValidatedUsers] = useState<string[]>([]);
  /** Set when the API accepts the save but reports per-user failures. */
  const [assignmentFailure, setAssignmentFailure] = useState<AssignmentFailure | null>(null);
  /** Reported in the modal, not as a toast, which portals outside its a11y boundary. */
  const [requestError, setRequestError] = useState<ReactNode | null>(null);

  const usersInputRef = useRef<HTMLTextAreaElement>(null);
  /** Focus target for the active step; only one renders, so both share the ref. */
  const stepContentRef = useRef<HTMLDivElement>(null);
  const requestErrorRef = useRef<HTMLDivElement>(null);
  const focusedStep = useRef<StepKey>(activeStep);

  const validateUsersMutation = useValidateUsers();
  const assignRoleMutation = useAssignTeamMembersRole();

  const handleUsersChange = useCallback((value: string) => {
    setInvalidUsers((prev) => (prev.length > 0 ? [] : prev));
    setUsers(value);
  }, []);

  const resetState = () => {
    const initialState = getInitialState(initialUsers);
    setActiveStep(initialState.activeStep);
    setUsers(initialState.users);
    setSelectedRole(initialState.selectedRole);
    setSelectedScopes(initialState.selectedScopes);
    setInvalidUsers(initialState.invalidUsers);
    setValidatedUsers(initialState.validatedUsers);
    setAssignmentFailure(null);
    setRequestError(null);
  };

  /** Same status-to-copy mapping the toasts use, so the wording stays consistent. */
  const handleRequestError = (error: unknown) => {
    logError(error as Error);
    const status = getHttpErrorStatus(error);
    const { messageId } = (status !== undefined && ERROR_TOAST_MAP[status]) || ERROR_TOAST_MAP.DEFAULT;
    setRequestError(intl.formatMessage(baseMessages[messageId], { Bold, Br }));
  };

  /**
   * Held open while a save is in flight: its response still runs `handleSave` after an
   * unmount, so it would close a reopened wizard or drop a partial-failure report.
   */
  const isSaving = assignRoleMutation.isPending;

  const handleClose = () => {
    // The header close button ignores `isBlocking`, so it is guarded here too.
    if (isSaving) return;
    resetState();
    onClose();
  };

  const validateUsersAndProceed = async () => {
    if (validateUsersMutation.isPending) return;
    const usersList = parseUsers(users);
    if (usersList.length === 0 || !selectedRole) return;

    setInvalidUsers([]);
    setRequestError(null);

    try {
      const result = await validateUsersMutation.mutateAsync({ data: { users: usersList } });
      if (result.invalidUsers?.length > 0) {
        setInvalidUsers(result.invalidUsers);
      } else {
        setValidatedUsers(usersList);
        setActiveStep(STEPS.DEFINE_APPLICATION_SCOPE);
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleScopeToggle = useCallback((scopeId: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeId))
        next.delete(scopeId);
      else
        next.add(scopeId);
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!selectedRole || selectedScopes.size === 0 || validatedUsers.length === 0) return;
    // A summary that outlived its save would credit this attempt with the last one's successes.
    setAssignmentFailure(null);
    setRequestError(null);

    try {
      const result = await assignRoleMutation.mutateAsync({
        data: {
          users: validatedUsers,
          role: selectedRole.role,
          scopes: Array.from(selectedScopes),
        },
      });

      if (result.errors?.length > 0) {
        // Reported inline in step 2, beside the scopes it names: a summary toast would
        // repeat the detail and sit over the Save button. `completed` comes along because
        // it decides whether the rest of the save landed, which the failures cannot say.
        setAssignmentFailure({
          errors: result.errors.map((e) => formatRoleAssignmentError(intl, e)),
          completedCount: result.completed?.length ?? 0,
        });
      } else {
        showToast({
          message: intl.formatMessage(messages['wizard.save.success']),
          type: 'success',
        });
        resetState();
        onClose();
      }
    } catch (error) {
      handleRequestError(error);
    }
  };

  useEffect(() => {
    if (invalidUsers.length && usersInputRef.current) {
      usersInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Validating disabled Next, dropping focus; put it on the field to correct.
      usersInputRef.current.focus();
    }
  }, [invalidUsers]);

  /** Next and Save disable while pending, so focus would strand on the old step's footer. */
  useEffect(() => {
    if (focusedStep.current === activeStep) {
      return;
    }
    focusedStep.current = activeStep;
    stepContentRef.current?.focus();
  }, [activeStep]);

  /** A reported failure stays on the step, so the effect above never fires. */
  useEffect(() => {
    if (assignmentFailure) {
      stepContentRef.current?.focus();
    }
  }, [assignmentFailure]);

  /** Put the failure under the keyboard, so Retry is the next thing reached. */
  useEffect(() => {
    if (requestError) {
      requestErrorRef.current?.focus();
    }
  }, [requestError]);

  const parsedUsers = parseUsers(users);
  const canProceed = parsedUsers.length > 0 && !!selectedRole;
  const canSave = selectedScopes.size > 0;
  /** Step 1 must stay free to grow and scroll; only step 2 fills the body height. */
  const isScopeStep = activeStep === STEPS.DEFINE_APPLICATION_SCOPE;
  /** Resolved per render, so Retry resubmits what is on screen rather than a stale copy. */
  const retryFailedRequest = isScopeStep ? handleSave : validateUsersAndProceed;

  return (
    <Stepper activeKey={activeStep}>
      <FullscreenModal
        title={intl.formatMessage(messages['wizard.modal.title'])}
        isOpen={isOpen}
        onClose={handleClose}
        isBlocking={isSaving}
        isOverflowVisible={false}
        className="authz-module assign-role-wizard"
        beforeBodyNode={<Stepper.Header className="border-bottom" />}
        // Between body and footer: beside the button that failed, never scrolled away.
        afterBodyNode={requestError && (
          <div className="mb-5 bg-light-200">
            <Alert
              variant="danger"
              ref={requestErrorRef}
              tabIndex={-1}
              className="mx-4 mb-0"
              dismissible
              onClose={() => setRequestError(null)}
              actions={[
                <Button key="retry" onClick={retryFailedRequest}>
                  {intl.formatMessage(baseMessages['authz.team.toast.retry.label'])}
                </Button>,
              ]}
            >
              {requestError}
            </Alert>
          </div>
        )}
        // Only the body is tinted. `pt-0` because each step pads itself; else 48px.
        modalBodyClassName={`bg-light-200 pt-0${isScopeStep ? ' assign-role-wizard__body--filled' : ''}`}
        footerNode={(
          <>
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
              {/* Back takes Cancel's slot here, per the design; the header close dismisses. */}
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSelectedScopes(new Set());
                  setAssignmentFailure(null);
                  // Retry is bound to the active step, so a save failure must not survive
                  // into step 1 where it would re-run validation instead.
                  setRequestError(null);
                  setActiveStep(STEPS.SELECT_USERS_AND_ROLE);
                }}
                disabled={isSaving}
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
                state={isSaving ? 'pending' : 'default'}
                onClick={handleSave}
                disabled={!canSave || isSaving}
              />
            </Stepper.ActionRow>
          </>
        )}
      >
        <Stepper.Step
          eventKey={STEPS.SELECT_USERS_AND_ROLE}
          title={intl.formatMessage(messages['wizard.step.selectUsersAndRole.title'])}
          hasError={invalidUsers.length > 0}
          description={invalidUsers.length > 0 ? intl.formatMessage(messages['wizard.step.selectUsersAndRole.error']) : ''}
          index={0}
        >
          <div ref={stepContentRef} tabIndex={-1} className="assign-role-wizard__step">
            <SelectUsersAndRoleStep
              users={users}
              setUsers={handleUsersChange}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              roleGroups={roleGroups}
              isLoadingRoles={isLoadingRoles}
              isRolesError={isRolesError}
              invalidUsers={invalidUsers}
              inputRef={usersInputRef}
            />
          </div>
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPS.DEFINE_APPLICATION_SCOPE}
          title={intl.formatMessage(messages['wizard.step.defineScope.title'])}
          index={1}
        >
          <div ref={stepContentRef} tabIndex={-1} className="assign-role-wizard__step">
            <DefineApplicationScopeStep
              scopeType={selectedRole?.scopeType ?? null}
              selectedScopes={selectedScopes}
              onScopeToggle={handleScopeToggle}
              assignmentFailure={assignmentFailure}
            />
          </div>
        </Stepper.Step>
      </FullscreenModal>
    </Stepper>
  );
};

export default AssignRoleWizard;
