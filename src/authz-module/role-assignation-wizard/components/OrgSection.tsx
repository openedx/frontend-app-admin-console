import { useState } from 'react';
import { Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Scope } from 'types';
import messages from '../messages';

interface ScopeCheckboxItemProps {
  scope: Scope;
  checked: boolean;
  onToggle: (scopeId: string) => void;
}

export const ScopeCheckboxItem = ({ scope, checked, onToggle }: ScopeCheckboxItemProps) => (
  <div className="mb-2">
    <div className="pgn__form-checkbox">
      <input
        type="checkbox"
        id={`scope-${scope.externalKey}`}
        className="pgn__form-checkbox-input"
        checked={checked}
        onChange={() => onToggle(scope.externalKey)}
      />
      <label
        className="pgn__form-label"
        htmlFor={`scope-${scope.externalKey}`}
        data-testid="toggle-scope"
      >
        {scope.displayName}
      </label>
    </div>
    {scope.description && (
      <small className="d-block text-muted pl-4">{scope.description}</small>
    )}
  </div>
);

export interface OrgSectionProps {
  orgName: string;
  scopes: Scope[];
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
  aggregateScopeItem?: Scope;
}

const OrgSection = ({
  orgName, scopes, selectedScopes, onScopeToggle, aggregateScopeItem,
}: OrgSectionProps) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="scope-org-group mb-3">
      <button
        type="button"
        className="d-flex align-items-center gap-1 bg-transparent border-0 p-0 mb-2 text-primary font-weight-bold"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <span>{intl.formatMessage(messages['wizard.step2.scopeList.orgLabel'], { orgName })}</span>
        <Icon src={collapsed ? ExpandMore : ExpandLess} className="text-primary" />
      </button>

      {!collapsed && (
        <div className="pl-2">
          {aggregateScopeItem && (
            <ScopeCheckboxItem
              scope={aggregateScopeItem}
              checked={selectedScopes.has(aggregateScopeItem.externalKey)}
              onToggle={onScopeToggle}
            />
          )}
          {scopes.map((scope) => (
            <ScopeCheckboxItem
              key={scope.externalKey}
              scope={scope}
              checked={selectedScopes.has(scope.externalKey)}
              onToggle={onScopeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgSection;
