import { useState, useEffect, useMemo } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Alert } from '@openedx/paragon';
import { WarningFilled, Error as ErrorIcon } from '@openedx/paragon/icons';
import type { AssignmentFailure } from '@src/authz-module/role-assignation-wizard/utils';
import { courseRolesMetadata } from '@src/authz-module/roles-permissions/course/constants';
import { libraryRolesMetadata } from '@src/authz-module/roles-permissions/library/constants';
import useScopeListData from '@src/authz-module/role-assignation-wizard/hooks/useScopeListData';
import ScopeFilterBar from './ScopeFilterBar';
import ScopeList from './ScopeList';
import messages from '@src/authz-module/role-assignation-wizard/messages';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

function getContextType(role: string | null): string | undefined {
  if (!role) return undefined;
  return allRolesMetadata.find((r) => r.role === role)?.contextType;
}

interface DefineApplicationScopeStepProps {
  selectedRole: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
  /** Reported by the last save, or null when there is nothing to report. */
  assignmentFailure?: AssignmentFailure | null;
}

const DefineApplicationScopeStep = ({
  selectedRole,
  selectedScopes,
  onScopeToggle,
  assignmentFailure = null,
}: DefineApplicationScopeStepProps) => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /** Separates "some of it worked" from "none of it did", which read differently. */
  const hasCompleted = (assignmentFailure?.completedCount ?? 0) > 0;

  const contextType = useMemo(
    () => getContextType(selectedRole),
    [selectedRole],
  );
  const contextLabelMessages = {
    course: messages['wizard.step2.contextLabel.course'],
    library: messages['wizard.step2.contextLabel.library'],
  };
  const contextLabel = contextType && contextLabelMessages[contextType]
    ? intl.formatMessage(contextLabelMessages[contextType])
    : intl.formatMessage(messages['wizard.step2.contextLabel.default']);

  const {
    organizations,
    orderedOrgs,
    scopesByOrg,
    allScopes,
    totalCount,
    queryState,
    platformAggregateScopeItem,
    orgAggregateScopeItems,
  } = useScopeListData({ contextType, search: debouncedSearch, orgs: selectedOrgs });

  return (
    <div className="define-application-scope-step py-4">
      <h3 className="mb-4">{intl.formatMessage(messages['wizard.step.defineScope.title'])}</h3>

      <ScopeFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedOrgs={selectedOrgs}
        onOrgsChange={setSelectedOrgs}
        contextType={contextType}
        contextLabel={contextLabel}
        allScopesCount={allScopes.length}
        totalCount={totalCount}
      />

      <hr className="my-4" />

      {assignmentFailure && (
        // Warning, not danger, when part of the save landed: the role was assigned, just
        // not everywhere. Nothing assigned at all stays danger.
        <Alert
          variant={hasCompleted ? 'warning' : 'danger'}
          icon={hasCompleted ? WarningFilled : ErrorIcon}
          className="mb-4"
        >
          <Alert.Heading>
            {intl.formatMessage(hasCompleted
              ? messages['wizard.step2.errors.alert.title.partial']
              : messages['wizard.step2.errors.alert.title.total'])}
          </Alert.Heading>
          <p className="mb-1">
            {hasCompleted
              ? intl.formatMessage(messages['wizard.step2.errors.alert.body.partial'], {
                  completedCount: assignmentFailure.completedCount,
                  failedCount: assignmentFailure.errors.length,
                })
              : intl.formatMessage(messages['wizard.step2.errors.alert.body.total'])}
          </p>
          <ul className="mb-0 pl-3">
            {assignmentFailure.errors.map((msg) => <li key={msg}>{msg}</li>)}
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
