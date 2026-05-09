import { useState } from 'react';
import { Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Scope } from '@src/types';
import messages from '../messages';
import ScopeCheckboxItem from './ScopeCheckboxItem';

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
