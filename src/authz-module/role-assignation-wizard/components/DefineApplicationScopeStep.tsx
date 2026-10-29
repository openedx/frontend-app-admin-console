import { useState, useEffect } from 'react';
import { useIntl } from '@openedx/frontend-base';
import type { MessageDescriptor } from '@openedx/frontend-base';
import { Alert } from '@openedx/paragon';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import useScopeListData from '@src/authz-module/role-assignation-wizard/hooks/useScopeListData';
import ScopeFilterBar from './ScopeFilterBar';
import ScopeList from './ScopeList';
import messages from '@src/authz-module/role-assignation-wizard/messages';

// Label of the scope type the scopes are filtered by.
const SCOPE_TYPE_LABELS: Partial<Record<string, MessageDescriptor>> = {
  [SCOPE_TYPES.COURSE]: messages['wizard.step2.contextLabel.course'],
  [SCOPE_TYPES.LIBRARY]: messages['wizard.step2.contextLabel.library'],
};

interface DefineApplicationScopeStepProps {
  // Scope type of the selected role.
  scopeType: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
  assignmentErrors?: string[];
}

const DefineApplicationScopeStep = ({
  scopeType,
  selectedScopes,
  onScopeToggle,
  assignmentErrors = [],
}: DefineApplicationScopeStepProps) => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const scopeTypeLabelMessage = scopeType ? SCOPE_TYPE_LABELS[scopeType] : undefined;
  const scopeTypeLabel = intl.formatMessage(scopeTypeLabelMessage ?? messages['wizard.step2.contextLabel.default']);

  const {
    organizations,
    orderedOrgs,
    scopesByOrg,
    allScopes,
    totalCount,
    queryState,
    platformAggregateScopeItem,
    orgAggregateScopeItems,
  } = useScopeListData({ scopeType: scopeType ?? undefined, search: debouncedSearch, orgs: selectedOrgs });

  return (
    <div className="define-application-scope-step">
      <h3 className="mb-4">{intl.formatMessage(messages['wizard.step.defineScope.title'])}</h3>

      <ScopeFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedOrgs={selectedOrgs}
        onOrgsChange={setSelectedOrgs}
        scopeType={scopeType ?? undefined}
        scopeTypeLabel={scopeTypeLabel}
        allScopesCount={allScopes.length}
        totalCount={totalCount}
      />

      <hr className="my-4" />

      {assignmentErrors.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <p className="mb-1 font-weight-bold">
            {intl.formatMessage(messages['wizard.step2.errors.alert.title'])}
          </p>
          <ul className="mb-0 pl-3">
            {assignmentErrors.map((msg) => <li key={msg}>{msg}</li>)}
          </ul>
        </Alert>
      )}

      <ScopeList
        orderedOrgs={orderedOrgs}
        scopesByOrg={scopesByOrg}
        organizations={organizations}
        selectedScopes={selectedScopes}
        onScopeToggle={onScopeToggle}
        queryState={queryState}
        platformAggregateScopeItem={platformAggregateScopeItem}
        orgAggregateScopeItems={orgAggregateScopeItems}
      />
    </div>
  );
};

export default DefineApplicationScopeStep;
