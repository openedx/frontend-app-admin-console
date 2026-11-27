import { useEffect, useId, useRef, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import {
  Alert, Dropdown, Form, Icon, SelectableBox, Spinner, Stack,
} from '@openedx/paragon';
import { isCustomRole } from '@src/authz-module/catalog';
import type { Role, ScopeCatalog } from '@src/authz-module/catalog';
import { RESOURCE_TYPE_DISPLAY } from '../constants';
import { MAX_ROLE_NAME_LENGTH, START_FROM } from '../customRoleDraft';
import type { CustomRoleDraft, StartFrom } from '../customRoleDraft';
import messages from '../messages';
import type { NameCheckError } from '../customRoleDraft';

interface NameAndResourceStepProps {
  draft: CustomRoleDraft;
  onChange: (changes: Partial<CustomRoleDraft>) => void;
  // The catalog of each resource type the user can view, in catalog order.
  scopeCatalogs: ScopeCatalog[];
  isLoading?: boolean;
  isError?: boolean;
  // Shows the missing answers' errors, after Next was pressed without them.
  showErrors?: boolean;
  // Grows each time a blocked Next is pressed, to move focus to the first missing answer.
  focusRequest?: number;
  // Why the name check kept the wizard on this step, shown as an alert; `null` when there is nothing to fix.
  nameCheckError: NameCheckError | null;
}

const START_FROM_OPTIONS = [START_FROM.SCRATCH, START_FROM.CLONE];
const ARROW_KEY_OFFSETS: Record<string, number> = {
  ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1,
};

/**
 * First step of the create custom role wizard: the role name, and either the resource type of a
 * role built from scratch or the role to clone. A clone copies the source role's resource type,
 * so the resource type field is swapped for the role picker instead of shown beside it.
 */
const NameAndResourceStep = ({
  draft, onChange, scopeCatalogs, isLoading = false, isError = false, showErrors = false, focusRequest = 0, nameCheckError,
}: NameAndResourceStepProps) => {
  const { formatMessage } = useIntl();
  const idPrefix = useId();
  const startFromLabelId = `${idPrefix}-start-from`;
  const sourceRoleLabelId = `${idPrefix}-source-role`;
  const sourceRoleToggleId = `${idPrefix}-source-role-toggle`;
  const sourceRoleErrorId = `${idPrefix}-source-role-error`;
  const nameInputId = `${idPrefix}-name`;
  const startFromCards = useRef<Record<string, HTMLDivElement | null>>({});
  const [isNameTouched, setIsNameTouched] = useState(false);

  const formatScopeType = (scopeType: string) => {
    const display = RESOURCE_TYPE_DISPLAY[scopeType];
    return display ? formatMessage(display.label) : scopeType;
  };

  // Standard roles are listed under their resource type; custom roles go in a group of their own.
  const standardGroups = scopeCatalogs
    .map(({ scopeType, roles }) => ({ scopeType, roles: roles.filter((role) => !isCustomRole(role)) }))
    .filter(({ roles }) => roles.length > 0);
  const customRoles = scopeCatalogs.flatMap(({ roles }) => roles.filter(isCustomRole));
  const selectedSourceRole = [...standardGroups.flatMap(({ roles }) => roles), ...customRoles]
    .find(({ role }) => role === draft.sourceRole);

  const isNameMissing = !draft.name.trim();
  const showNameError = isNameMissing && (isNameTouched || showErrors);
  const showSourceRoleError = showErrors && draft.startFrom === START_FROM.CLONE && !selectedSourceRole;

  // A blocked Next moves focus to the first answer it needs, where the error is read out.
  useEffect(() => {
    if (focusRequest === 0) return;
    document.getElementById(isNameMissing ? nameInputId : sourceRoleToggleId)?.focus();
    // Only a new press should move focus, not later edits of the answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest]);

  // Radio cards are a single tab stop; the arrow keys move between them, as in a native radio group.
  const handleStartFromKeyDown = (e: React.KeyboardEvent) => {
    const offset = ARROW_KEY_OFFSETS[e.key];
    if (!offset) return;
    e.preventDefault();
    const index = START_FROM_OPTIONS.indexOf(draft.startFrom);
    const next = START_FROM_OPTIONS[(index + offset + START_FROM_OPTIONS.length) % START_FROM_OPTIONS.length];
    onChange({ startFrom: next });
    startFromCards.current[next]?.focus();
  };

  const formatRoleName = (role: Role) => (isCustomRole(role)
    ? formatMessage(messages['authz.roles.create.wizard.sourceRole.custom'], { role: role.displayName })
    : role.displayName);

  return (
    <Stack gap={4} className="py-4">
      <Form.Group controlId={nameInputId} className="mb-0">
        <Form.Label className="h4 text-primary">
          {formatMessage(messages['authz.roles.create.wizard.name.label'])}
        </Form.Label>
        <Form.Control
          value={draft.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value })}
          onBlur={() => setIsNameTouched(true)}
          placeholder={formatMessage(messages['authz.roles.create.wizard.name.placeholder'])}
          isInvalid={showNameError || nameCheckError !== null}
          maxLength={MAX_ROLE_NAME_LENGTH}
          required
        />
        {showNameError && (
          <Form.Control.Feedback type="invalid" hasIcon={false}>
            {formatMessage(messages['authz.roles.create.wizard.name.error'])}
          </Form.Control.Feedback>
        )}
        {!showNameError && nameCheckError && (
          <Form.Control.Feedback type="invalid" hasIcon={false} role="alert">
            {formatMessage(messages[`authz.roles.create.wizard.name.alert.${nameCheckError}`])}
          </Form.Control.Feedback>
        )}
        <Form.Control.Feedback type="default">
          {formatMessage(messages['authz.roles.create.wizard.name.helper'])}
        </Form.Control.Feedback>
      </Form.Group>

      <div>
        <p id={startFromLabelId} className="h4 text-primary mb-2">
          {formatMessage(messages['authz.roles.create.wizard.startFrom.label'])}
        </p>
        <SelectableBox.Set
          name="start-from"
          type="radio"
          columns={2}
          value={draft.startFrom}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ startFrom: e.target.value as StartFrom })}
          ariaLabelledby={startFromLabelId}
          className="create-custom-role-wizard__start-from"
          onKeyDown={handleStartFromKeyDown}
        >
          {START_FROM_OPTIONS.map((option) => (
            // SelectableBox renders a button over a hidden radio, so the radio state is restated on it.
            <SelectableBox
              key={option}
              value={option}
              type="radio"
              role="radio"
              aria-checked={draft.startFrom === option}
              // Roving tab stop: only the checked card is reachable with Tab.
              tabIndex={draft.startFrom === option ? 0 : -1}
              ref={(card: HTMLDivElement | null) => {
                startFromCards.current[option] = card;
              }}
            >
              <p className="create-custom-role-wizard__option-title font-weight-bold mb-1">
                {formatMessage(messages[`authz.roles.create.wizard.startFrom.${option}.title`])}
              </p>
              <p className="small text-gray-500 mb-0">
                {formatMessage(messages[`authz.roles.create.wizard.startFrom.${option}.description`])}
              </p>
            </SelectableBox>
          ))}
        </SelectableBox.Set>
      </div>

      {isLoading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" screenReaderText={formatMessage(messages['authz.roles.create.wizard.loading'])} />
        </div>
      )}
      {isError && (
        <Alert variant="danger" className="mb-0">
          {formatMessage(messages['authz.roles.create.wizard.error'])}
        </Alert>
      )}

      {!isLoading && !isError && draft.startFrom === START_FROM.SCRATCH && (
        <Form.Group controlId={`${idPrefix}-resource-type`} className="mb-0">
          <Form.Label className="h4 text-primary">
            {formatMessage(messages['authz.roles.create.wizard.resourceType.label'])}
          </Form.Label>
          <Form.Control
            as="select"
            value={draft.scopeType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ scopeType: e.target.value })}
            required
          >
            {scopeCatalogs.map(({ scopeType }) => (
              <option key={scopeType} value={scopeType}>{formatScopeType(scopeType)}</option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="default">
            {formatMessage(messages['authz.roles.create.wizard.resourceType.helper'])}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {!isLoading && !isError && draft.startFrom === START_FROM.CLONE && (
        <div>
          <p id={sourceRoleLabelId} className="h4 text-primary mb-2">
            {formatMessage(messages['authz.roles.create.wizard.sourceRole.label'])}
          </p>
          {/* A native select can't nest groups or show icons, which the resource type headers need. */}
          <Dropdown
            className="create-custom-role-wizard__source-role"
            onSelect={(roleId: string | null) => roleId && onChange({ sourceRole: roleId })}
          >
            <Dropdown.Toggle
              id={sourceRoleToggleId}
              as="button"
              type="button"
              className={`form-control d-flex align-items-center justify-content-between text-left${showSourceRoleError ? ' is-invalid' : ''}`}
              // Names the button by its label and the selected role, as a select would read.
              aria-labelledby={`${sourceRoleLabelId} ${sourceRoleToggleId}`}
              aria-describedby={showSourceRoleError ? sourceRoleErrorId : undefined}
            >
              {selectedSourceRole
                ? formatRoleName(selectedSourceRole)
                : formatMessage(messages['authz.roles.create.wizard.sourceRole.placeholder'])}
            </Dropdown.Toggle>
            {/* role="menu" also makes the menu move focus to its first item when opened by keyboard. */}
            <Dropdown.Menu role="menu" className="w-100 create-custom-role-wizard__source-role-menu">
              {standardGroups.length > 0 && (
                <div
                  role="group"
                  aria-label={formatMessage(messages['authz.roles.create.wizard.sourceRole.group.standard'])}
                >
                  {/* The group's aria-label already names it, and a heading may not sit in a menu. */}
                  <Dropdown.Header aria-hidden="true">
                    {formatMessage(messages['authz.roles.create.wizard.sourceRole.group.standard'])}
                  </Dropdown.Header>
                  {standardGroups.map(({ scopeType, roles }) => {
                    const display = RESOURCE_TYPE_DISPLAY[scopeType];
                    return (
                      <div key={scopeType} role="group" aria-label={formatScopeType(scopeType)}>
                        <Dropdown.Header aria-hidden="true" className="d-flex align-items-center text-info-500">
                          {display && <Icon src={display.icon} size="sm" className="mr-2" />}
                          {formatScopeType(scopeType)}
                        </Dropdown.Header>
                        {roles.map((role) => (
                          <Dropdown.Item
                            key={role.role}
                            as="button"
                            type="button"
                            role="menuitemradio"
                            aria-checked={role.role === draft.sourceRole}
                            eventKey={role.role}
                            active={role.role === draft.sourceRole}
                          >
                            {role.displayName}
                          </Dropdown.Item>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
              {customRoles.length > 0 && (
                <div
                  role="group"
                  aria-label={formatMessage(messages['authz.roles.create.wizard.sourceRole.group.custom'])}
                >
                  {standardGroups.length > 0 && <Dropdown.Divider />}
                  <Dropdown.Header aria-hidden="true">
                    {formatMessage(messages['authz.roles.create.wizard.sourceRole.group.custom'])}
                  </Dropdown.Header>
                  {customRoles.map((role) => (
                    <Dropdown.Item
                      key={role.role}
                      as="button"
                      type="button"
                      role="menuitemradio"
                      aria-checked={role.role === draft.sourceRole}
                      eventKey={role.role}
                      active={role.role === draft.sourceRole}
                    >
                      {role.displayName}
                    </Dropdown.Item>
                  ))}
                </div>
              )}
            </Dropdown.Menu>
          </Dropdown>
          {showSourceRoleError && (
            <p id={sourceRoleErrorId} className="small text-danger mt-1 mb-0">
              {formatMessage(messages['authz.roles.create.wizard.sourceRole.error'])}
            </p>
          )}
        </div>
      )}
    </Stack>
  );
};

export default NameAndResourceStep;
