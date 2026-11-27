import {
  useEffect, useId, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { logError, useIntl } from '@openedx/frontend-base';
import {
  Alert, Button, Container, FullscreenModal, Icon, StatefulButton, Stepper,
} from '@openedx/paragon';
import { Add, SpinnerSimple } from '@openedx/paragon/icons';
import { useAuthzCatalog, useCreateCustomRole } from '@src/authz-module/catalog';
import type { ScopeCatalog } from '@src/authz-module/catalog';
import baseMessages from '@src/authz-module/messages';
import { ERROR_TOAST_MAP, useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import { getHttpErrorStatus } from '@src/data/utils';
import {
  EMPTY_CUSTOM_ROLE_DRAFT, START_FROM, buildCreateCustomRoleRequest, getCustomRoleSeed, isSameRoleName,
} from '../customRoleDraft';
import type { CustomRoleDraft } from '../customRoleDraft';
import { usePermissionSelection } from '../hooks/usePermissionSelection';
import messages from '../messages';
import NameAndResourceStep from './NameAndResourceStep';
import PermissionsStep from './PermissionsStep';

const STEPS = {
  NAME_AND_RESOURCE: 'name-and-resource',
  PERMISSIONS: 'permissions',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

/**
 * The rejections the user can act on, shown with our own wording rather than the server's, which
 * isn't translated. Any other failure is shown with the app's usual error message and a Retry.
 */
const CREATE_ERRORS: Record<number, 'nameTaken' | 'invalid' | 'forbidden'> = {
  409: 'nameTaken',
  400: 'invalid',
  403: 'forbidden',
};

interface CreateError {
  message: ReactNode;
  // Only failures that may pass on their own offer a retry; resending a rejected role changes nothing.
  canRetry: boolean;
  // A taken name is fixed in the name field, which takes focus in place of the alert.
  isNameTaken?: boolean;
}

const NEXT_BLOCKERS = {
  NAME: 'name',
  CATALOG_LOADING: 'catalogLoading',
  CATALOG_ERROR: 'catalogError',
  NAME_TAKEN: 'nameTaken',
  SOURCE_ROLE: 'sourceRole',
} as const;

interface CreateCustomRoleWizardProps {
  /** Called on Cancel, header close and Esc, and once the role is created. */
  onClose: () => void;
}

/**
 * Full-screen modal, like the assign role wizard, so creating a role never leaves the page.
 * `Stepper` wraps it because its header, steps and action rows go into three modal slots that
 * share one context. Closing it once the role is created leaves the user on the roles table,
 * which lists the new role.
 */
export const CreateCustomRoleWizard = ({ onClose }: CreateCustomRoleWizardProps) => {
  const { formatMessage } = useIntl();
  const { showToast, Bold, Br } = useToastManager();
  const createRole = useCreateCustomRole();
  const isSaving = createRole.isPending;
  const [createError, setCreateError] = useState<CreateError | null>(null);
  const createErrorRef = useRef<HTMLDivElement>(null);
  const {
    scopeTypes, getScopeCatalog, getRole, isLoading, isError,
  } = useAuthzCatalog();
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.NAME_AND_RESOURCE);
  const [draft, setDraft] = useState<CustomRoleDraft>(EMPTY_CUSTOM_ROLE_DRAFT);
  // Set once Next is pressed with a missing answer, so the step shows its errors from then on.
  const [hasTriedNext, setHasTriedNext] = useState(false);
  // Counts the presses of a blocked Next, so the step can move focus to the first missing answer.
  const [focusRequest, setFocusRequest] = useState(0);
  const nextHintId = `${useId()}-next-hint`;
  // The name a create was rejected for, kept so the field stays in error while it is typed again.
  const [takenName, setTakenName] = useState<string | null>(null);
  /** Focus target of the active step, so focus doesn't stay on the footer of the step that left. */
  const stepContentRef = useRef<HTMLDivElement>(null);
  const focusedStep = useRef<StepKey>(activeStep);

  // Set when a taken name sends the user back, so the name field keeps the focus the step gave it.
  const isReturningToName = useRef(false);
  useEffect(() => {
    if (focusedStep.current === activeStep) return;
    focusedStep.current = activeStep;
    if (isReturningToName.current) {
      isReturningToName.current = false;
      return;
    }
    stepContentRef.current?.focus();
  }, [activeStep]);

  // Put the alert under the keyboard, so the user hears why the role wasn't created.
  useEffect(() => {
    if (createError && !createError.isNameTaken) {
      createErrorRef.current?.focus();
    }
  }, [createError]);

  const scopeCatalogs = scopeTypes
    .map(getScopeCatalog)
    .filter((scopeCatalog): scopeCatalog is ScopeCatalog => scopeCatalog !== undefined);
  // The resource type field shows the first resource type until another is picked, so it counts as picked.
  const effectiveDraft = draft.scopeType ? draft : { ...draft, scopeType: scopeTypes[0] ?? '' };
  const seed = getCustomRoleSeed(effectiveDraft, getRole);
  const isNameTaken = takenName !== null && isSameRoleName(draft.name, takenName);
  const canProceed = seed !== null && !isNameTaken;
  const seedScopeCatalog = scopeCatalogs.find(({ scopeType }) => scopeType === seed?.scopeType);
  const scopePermissions = useMemo(
    () => seedScopeCatalog?.permissions ?? [],
    [seedScopeCatalog],
  );
  // Lives here, not in the step, so the choices survive Back.
  const permissionSelection = usePermissionSelection(
    seed,
    draft.startFrom === START_FROM.CLONE ? draft.sourceRole : null,
    scopePermissions,
  );
  let nextBlocker: typeof NEXT_BLOCKERS[keyof typeof NEXT_BLOCKERS] | null = null;
  if (!draft.name.trim()) {
    nextBlocker = NEXT_BLOCKERS.NAME;
  } else if (isLoading) {
    nextBlocker = NEXT_BLOCKERS.CATALOG_LOADING;
  } else if (isError || !scopeTypes.length) {
    // A catalog that loaded with no resource types leaves nothing to pick, so it reads as a failure too.
    nextBlocker = NEXT_BLOCKERS.CATALOG_ERROR;
  } else if (isNameTaken) {
    nextBlocker = NEXT_BLOCKERS.NAME_TAKEN;
  } else if (!canProceed && draft.startFrom === START_FROM.CLONE) {
    nextBlocker = NEXT_BLOCKERS.SOURCE_ROLE;
  }

  const stepTitles = {
    [STEPS.NAME_AND_RESOURCE]: formatMessage(messages['authz.roles.create.wizard.step.nameAndResource']),
    [STEPS.PERMISSIONS]: formatMessage(messages['authz.roles.create.wizard.step.permissions']),
  };
  // The Stepper header marks the active step with a class only, so each step names itself instead.
  const getStepLabel = (step: StepKey) => formatMessage(messages['authz.roles.create.wizard.step.status'], {
    current: Object.values(STEPS).indexOf(step) + 1,
    total: Object.values(STEPS).length,
    title: stepTitles[step],
  });

  const handleDraftChange = (changes: Partial<CustomRoleDraft>) => {
    // The name is only edited on the first step, where the only alert is the taken name one. It
    // describes the old name, so it closes once the name is changed.
    if (changes.name !== undefined && takenName !== null && !isSameRoleName(changes.name, takenName)) {
      setCreateError(null);
    }
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  const handleNext = () => {
    if (!canProceed) {
      setHasTriedNext(true);
      setFocusRequest((count) => count + 1);
      return;
    }
    setDraft(effectiveDraft);
    setActiveStep(STEPS.PERMISSIONS);
  };

  // The header close button ignores `isBlocking`, so it is guarded here too.
  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleBack = () => {
    // The fix for a rejected role may be on the first step, so the alert doesn't follow the user there.
    setCreateError(null);
    setActiveStep(STEPS.NAME_AND_RESOURCE);
  };

  const handleCreate = async () => {
    setCreateError(null);
    // Create is disabled while saving or with no permission, and lives on the permissions step,
    // which Next only opens once there is a seed.
    const request = buildCreateCustomRoleRequest(draft, seed!, permissionSelection.effective, scopePermissions);
    try {
      const role = await createRole.mutateAsync(request);
      showToast({
        message: formatMessage(messages['authz.roles.create.wizard.success'], { name: role.displayName }),
        type: 'success',
      });
      onClose();
    } catch (error) {
      const status = getHttpErrorStatus(error);
      const errorKey = status === undefined ? undefined : CREATE_ERRORS[status];
      if (errorKey) {
        const isTaken = errorKey === 'nameTaken';
        setCreateError({
          message: formatMessage(messages[`authz.roles.create.wizard.error.${errorKey}`], { name: request.displayName }),
          canRetry: false,
          isNameTaken: isTaken,
        });
        if (isTaken) {
          // The name is fixed on the first step, so the user is taken there with focus on the field.
          setTakenName(request.displayName);
          isReturningToName.current = true;
          setFocusRequest((count) => count + 1);
          setActiveStep(STEPS.NAME_AND_RESOURCE);
        }
      } else {
        // Shown in the wizard, not a toast: the modal blocks the page behind it, a toast's Retry included.
        logError(error as Error);
        const { messageId } = (status !== undefined && ERROR_TOAST_MAP[status]) || ERROR_TOAST_MAP.DEFAULT;
        setCreateError({ message: formatMessage(baseMessages[messageId], { Bold, Br }), canRetry: true });
      }
    }
  };

  return (
    <Stepper activeKey={activeStep}>
      <FullscreenModal
        title={formatMessage(messages['authz.roles.create.wizard.title'])}
        isOpen
        onClose={handleClose}
        isBlocking={isSaving}
        isOverflowVisible={false}
        className="authz-module create-custom-role-wizard"
        beforeBodyNode={<Stepper.Header className="border-bottom" />}
        // Floats over the bottom of the step content, beside Create, so it is never scrolled away
        // and doesn't shrink the body.
        afterBodyNode={createError && (
          <div className="after-body-stepper__alert-anchor">
            <Alert
              variant="danger"
              ref={createErrorRef}
              tabIndex={-1}
              className="stepper__alert mx-4 mb-4 shadow"
              dismissible
              onClose={() => setCreateError(null)}
              actions={createError.canRetry ? [
                <Button key="retry" onClick={handleCreate}>
                  {formatMessage(baseMessages['authz.team.toast.retry.label'])}
                </Button>,
              ] : undefined}
            >
              {createError.message}
            </Alert>
          </div>
        )}
        modalBodyClassName="bg-light-200 pt-0"
        footerNode={(
          <>
            <Stepper.ActionRow eventKey={STEPS.NAME_AND_RESOURCE}>
              <Button variant="outline-primary" onClick={handleClose}>
                {formatMessage(messages['authz.roles.create.wizard.button.cancel'])}
              </Button>
              <Stepper.ActionRow.Spacer />
              {/* aria-disabled, not disabled, so Next stays focusable and can say what is missing. */}
              <Button
                onClick={handleNext}
                className={canProceed ? undefined : 'disabled'}
                aria-disabled={!canProceed}
                aria-describedby={nextBlocker ? nextHintId : undefined}
              >
                {formatMessage(messages['authz.roles.create.wizard.button.next'])}
              </Button>
              {nextBlocker && (
                <span id={nextHintId} className="sr-only">
                  {formatMessage(messages[`authz.roles.create.wizard.button.next.hint.${nextBlocker}`])}
                </span>
              )}
            </Stepper.ActionRow>
            <Stepper.ActionRow eventKey={STEPS.PERMISSIONS}>
              <Button variant="outline-primary" onClick={handleBack} disabled={isSaving}>
                {formatMessage(messages['authz.roles.create.wizard.button.back'])}
              </Button>
              <Stepper.ActionRow.Spacer />
              <StatefulButton
                labels={{
                  default: formatMessage(messages['authz.roles.create.wizard.button.submit']),
                  pending: formatMessage(messages['authz.roles.create.wizard.button.submit.pending']),
                }}
                icons={{ pending: <Icon src={SpinnerSimple} /> }}
                state={isSaving ? 'pending' : 'default'}
                onClick={handleCreate}
                disabled={permissionSelection.selectedCount === 0 || isSaving}
              />
            </Stepper.ActionRow>
          </>
        )}
      >
        <Stepper.Step
          eventKey={STEPS.NAME_AND_RESOURCE}
          title={stepTitles[STEPS.NAME_AND_RESOURCE]}
          hasError={isNameTaken}
          index={0}
        >
          <div
            ref={stepContentRef}
            tabIndex={-1}
            role="group"
            aria-label={getStepLabel(STEPS.NAME_AND_RESOURCE)}
            className="create-custom-role-wizard__step"
          >
            <Container fluid size="xl" className="px-0">
              <NameAndResourceStep
                draft={effectiveDraft}
                onChange={handleDraftChange}
                scopeCatalogs={scopeCatalogs}
                isLoading={isLoading}
                isError={isError}
                showErrors={hasTriedNext}
                isNameTaken={isNameTaken}
                focusRequest={focusRequest}
              />
            </Container>
          </div>
        </Stepper.Step>
        <Stepper.Step
          eventKey={STEPS.PERMISSIONS}
          title={stepTitles[STEPS.PERMISSIONS]}
          index={1}
        >
          <div
            ref={stepContentRef}
            tabIndex={-1}
            role="group"
            aria-label={getStepLabel(STEPS.PERMISSIONS)}
            className="create-custom-role-wizard__step"
          >
            <Container fluid size="xl" className="px-0">
              <PermissionsStep
                categories={seedScopeCatalog?.categories ?? []}
                permissions={scopePermissions}
                selection={permissionSelection}
              />
            </Container>
          </div>
        </Stepper.Step>
      </FullscreenModal>
    </Stepper>
  );
};

/**
 * Header button of the roles and permissions tab that opens the create custom role wizard.
 *
 * The wizard is mounted only while open, as `AddRoleButton` does, so each opening starts from
 * an empty draft and Cancel needs no reset.
 */
const CreateCustomRole = () => {
  const { formatMessage } = useIntl();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  return (
    <>
      <Button size="sm" iconBefore={Add} onClick={() => setIsWizardOpen(true)}>
        {formatMessage(messages['authz.roles.create.button'])}
      </Button>
      {isWizardOpen && <CreateCustomRoleWizard onClose={() => setIsWizardOpen(false)} />}
    </>
  );
};

export default CreateCustomRole;
