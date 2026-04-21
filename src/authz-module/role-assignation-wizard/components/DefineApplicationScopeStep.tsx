import { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { courseRolesMetadata } from '@src/authz-module/roles-permissions/course/constants';
import { libraryRolesMetadata } from '@src/authz-module/roles-permissions/library/constants';
import useScopeListData from './useScopeListData';
import ScopeFilterBar from './ScopeFilterBar';
import ScopeList from './ScopeList';
import messages from '../messages';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

function getContextType(role: string | null): string | undefined {
  if (!role) { return undefined; }
  return allRolesMetadata.find((r) => r.role === role)?.contextType;
}

function getContextLabel(contextType: string | undefined): string {
  if (contextType === 'course') { return 'Courses'; }
  if (contextType === 'library') { return 'Libraries'; }
  return 'Items';
}

interface DefineApplicationScopeStepProps {
  selectedRole: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
}

const DefineApplicationScopeStep = ({
  selectedRole,
  selectedScopes,
  onScopeToggle,
}: DefineApplicationScopeStepProps) => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const contextType = getContextType(selectedRole);
  const contextLabel = getContextLabel(contextType);

  const {
    organizations,
    orderedOrgs,
    scopesByOrg,
    allScopes,
    totalCount,
    queryState,
    platformAggregateScopeItem,
    showOrgAggregates,
  } = useScopeListData({ contextType, search: debouncedSearch, org: selectedOrg });

  return (
    <div className="define-application-scope-step">
      <h3 className="mb-4">{intl.formatMessage(messages['wizard.step.defineScope.title'])}</h3>

      <ScopeFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedOrg={selectedOrg}
        onOrgChange={setSelectedOrg}
        organizations={organizations}
        contextType={contextType}
        contextLabel={contextLabel}
        allScopesCount={allScopes.length}
        totalCount={totalCount}
      />

      <hr className="my-4" />

      <ScopeList
        orderedOrgs={orderedOrgs}
        scopesByOrg={scopesByOrg}
        organizations={organizations}
        selectedScopes={selectedScopes}
        onScopeToggle={onScopeToggle}
        queryState={queryState}
        platformAggregateScopeItem={platformAggregateScopeItem}
        showOrgAggregates={showOrgAggregates}
        contextType={contextType}
      />
    </div>
  );
};

export default DefineApplicationScopeStep;
