import { useEffect, useId, useRef, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button, FullscreenModal, Stepper } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import type { ScopeCatalog } from '@src/authz-module/catalog';
import { EMPTY_CUSTOM_ROLE_DRAFT, START_FROM, getCustomRoleSeed } from '../customRoleDraft';
import type { CustomRoleDraft, NameCheckError } from '../customRoleDraft';
import { useValidateRoleName } from '../../data/hooks';
import messages from '../messages';
import NameAndResourceStep from './NameAndResourceStep';

const STEPS = {
  NAME_AND_RESOURCE: 'name-and-resource',
  PERMISSIONS: 'permissions',
} as const;

type StepKey = typeof STEPS[keyof typeof STEPS];

// Why Next does nothing, so a screen reader can be told; `null` when there is nothing to fix.
const NEXT_BLOCKERS = {
  NAME: 'name',
  NAME_REJECTED: 'nameRejected',
  CATALOG_LOADING: 'catalogLoading',
  CATALOG_ERROR: 'catalogError',
  SOURCE_ROLE: 'sourceRole',
} as const;

interface CreateCustomRoleWizardProps {
  /** Called on Cancel, header close and Esc. */
  onClose: () => void;
}

/**
 * Full-screen modal, like the assign role wizard, so creating a role never leaves the page.
 * `Stepper` wraps it because its header, steps and action rows go into three modal slots that
 * share one context.
 *
 * TODO: the permissions step is a placeholder, built in
 * https://github.com/openedx/openedx-authz/issues/572 from `getCustomRoleSeed(draft, getRole)`.
 */
export const CreateCustomRoleWizard = ({ onClose }: CreateCustomRoleWizardProps) => {
  const { formatMessage } = useIntl();
  const {
    scopeTypes, getScopeCatalog, getRole, isLoading, isError,
  } = useAuthzCatalog();
  const [activeStep, setActiveStep] = useState<StepKey>(STEPS.NAME_AND_RESOURCE);
  const [draft, setDraft] = useState<CustomRoleDraft>(EMPTY_CUSTOM_ROLE_DRAFT);
  // Set once Next is pressed with a missing answer, so the step shows its errors from then on.
  const [hasTriedNext, setHasTriedNext] = useState(false);
  // Counts the presses of a blocked Next, so the step can move focus to the first missing answer.
  const [focusRequest, setFocusRequest] = useState(0);
  const [nameCheckError, setNameCheckError] = useState<NameCheckError | null>(null);
  const { mutateAsync: validateRoleName, isPending: isCheckingName } = useValidateRoleName();
  const nextHintId = `${useId()}-next-hint`;
  /** Focus target of the active step, so focus doesn't stay on the footer of the step that left. */
  const stepContentRef = useRef<HTMLDivElement>(null);
  const focusedStep = useRef<StepKey>(activeStep);

  useEffect(() => {
    if (focusedStep.current === activeStep) return;
    focusedStep.current = activeStep;
    stepContentRef.current?.focus();
  }, [activeStep]);

  const scopeCatalogs = scopeTypes
    .map(getScopeCatalog)
    .filter((scopeCatalog): scopeCatalog is ScopeCatalog => scopeCatalog !== undefined);
  // The resource type field shows the first resource type until another is picked, so it counts as picked.
  const effectiveDraft = draft.scopeType ? draft : { ...draft, scopeType: scopeTypes[0] ?? '' };
  const canProceed = getCustomRoleSeed(effectiveDraft, getRole) !== null;
  // A rejected name stays rejected until it changes; a failed check can be retried as is.
  const isNameRejected = nameCheckError === 'taken' || nameCheckError === 'invalid';
  let nextBlocker: typeof NEXT_BLOCKERS[keyof typeof NEXT_BLOCKERS] | null = null;
  if (!draft.name.trim()) {
    nextBlocker = NEXT_BLOCKERS.NAME;
  } else if (isNameRejected) {
    nextBlocker = NEXT_BLOCKERS.NAME_REJECTED;
  } else if (isLoading) {
    nextBlocker = NEXT_BLOCKERS.CATALOG_LOADING;
  } else if (isError || !scopeTypes.length) {
    // A catalog that loaded with no resource types leaves nothing to pick, so it reads as a failure too.
    nextBlocker = NEXT_BLOCKERS.CATALOG_ERROR;
  } else if (!canProceed && draft.startFrom === START_FROM.CLONE) {
    nextBlocker = NEXT_BLOCKERS.SOURCE_ROLE;
  }

  const isNextDisabled = !canProceed || isCheckingName || isNameRejected;

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
    // A new name makes the previous check result stale.
    if (changes.name !== undefined) setNameCheckError(null);
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  /**
   * The name is checked on Next, not while typing, because the check is not a reservation:
   * the final create can still conflict, and a check per keystroke would only add requests.
   */
  const handleNext = async () => {
    if (isCheckingName || isNameRejected) return;
    if (!canProceed) {
      setHasTriedNext(true);
      setFocusRequest((count) => count + 1);
      return;
    }
    try {
      const result = await validateRoleName(effectiveDraft.name);
      if (!result.available) {
        setNameCheckError(result.reason === 'invalid' ? 'invalid' : 'taken');
        return;
      }
    } catch {
      setNameCheckError('failed');
      return;
    }
    setNameCheckError(null);
    setDraft(effectiveDraft);
    setActiveStep(STEPS.PERMISSIONS);
  };

  return (
    <Stepper activeKey={activeStep}>
      <FullscreenModal
        title={formatMessage(messages['authz.roles.create.wizard.title'])}
        isOpen
        onClose={onClose}
        isOverflowVisible={false}
        className="authz-module create-custom-role-wizard"
        beforeBodyNode={<Stepper.Header className="border-bottom" />}
        modalBodyClassName="bg-light-200 pt-0"
        footerNode={(
          <>
            <Stepper.ActionRow eventKey={STEPS.NAME_AND_RESOURCE}>
              <Button variant="outline-primary" onClick={onClose}>
                {formatMessage(messages['authz.roles.create.wizard.button.cancel'])}
              </Button>
              <Stepper.ActionRow.Spacer />
              {/* aria-disabled, not disabled, so Next stays focusable and can say what is missing. */}
              <Button
                onClick={handleNext}
                className={isNextDisabled ? 'disabled' : undefined}
                aria-disabled={isNextDisabled}
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
              <Button variant="outline-primary" onClick={() => setActiveStep(STEPS.NAME_AND_RESOURCE)}>
                {formatMessage(messages['authz.roles.create.wizard.button.back'])}
              </Button>
              <Stepper.ActionRow.Spacer />
            </Stepper.ActionRow>
          </>
        )}
      >
        <Stepper.Step
          eventKey={STEPS.NAME_AND_RESOURCE}
          title={stepTitles[STEPS.NAME_AND_RESOURCE]}
          index={0}
        >
          <div
            ref={stepContentRef}
            tabIndex={-1}
            role="group"
            aria-label={getStepLabel(STEPS.NAME_AND_RESOURCE)}
            className="create-custom-role-wizard__step"
          >
            <NameAndResourceStep
              draft={effectiveDraft}
              onChange={handleDraftChange}
              scopeCatalogs={scopeCatalogs}
              isLoading={isLoading}
              isError={isError}
              showErrors={hasTriedNext}
              focusRequest={focusRequest}
              nameCheckError={nameCheckError}
            />
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
          />
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
