import { useEffect, useRef, useState } from 'react';
import { Icon, Spinner } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Org, Scope } from 'types';
import messages from '../messages';

// --- ScopeCheckboxItem ---

interface ScopeCheckboxItemProps {
  scope: Scope;
  checked: boolean;
  onToggle: (scopeId: string) => void;
}

const ScopeCheckboxItem = ({ scope, checked, onToggle }: ScopeCheckboxItemProps) => (
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

// --- OrgSection ---

interface OrgSectionProps {
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

// --- ScopeList ---

interface ScopeListQueryState {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isError: boolean;
  fetchNextPage: () => void;
}

interface ScopeListProps {
  orderedOrgs: string[];
  scopesByOrg: Record<string, Scope[]>;
  organizations: Org[] | undefined;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
  queryState: ScopeListQueryState;
  platformAggregateScopeItem: Scope | null;
  showOrgAggregates: boolean;
  contextType: string | undefined;
}

const ScopeList = ({
  orderedOrgs,
  scopesByOrg,
  organizations,
  selectedScopes,
  onScopeToggle,
  queryState,
  platformAggregateScopeItem,
  showOrgAggregates,
  contextType,
}: ScopeListProps) => {
  const intl = useIntl();
  const {
    isLoading, isFetchingNextPage, hasNextPage, isError, fetchNextPage,
  } = queryState;
  const aggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.course'])
    : contextType === 'library'
      ? intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.library'])
      : '';
  const aggregateDescription = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.description.course'])
    : contextType === 'library'
      ? intl.formatMessage(messages['wizard.step2.scope.aggregate.description.library'])
      : '';
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) { return undefined; }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  return (
    <div className="scope-list border rounded p-3 bg-light-100">
      {isLoading ? (
        <div className="d-flex justify-content-center p-4">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages['wizard.step2.scopeList.loading'])} />
        </div>
      ) : (
        <>
          {platformAggregateScopeItem && (
            <ScopeCheckboxItem
              scope={platformAggregateScopeItem}
              checked={selectedScopes.has(platformAggregateScopeItem.externalKey)}
              onToggle={onScopeToggle}
            />
          )}

          {orderedOrgs.map((org) => {
            const aggregateScopeItem: Scope | undefined = (contextType && showOrgAggregates)
              ? {
                externalKey: contextType === 'course' ? `course-v1:${org}+*` : `lib:${org}:*`,
                displayName: aggregateLabel,
                description: aggregateDescription,
                org: { id: 0, name: org, shortName: org },
              }
              : undefined;

            return (
              <OrgSection
                key={org}
                orgName={organizations?.find((o) => o.shortName === org)?.name || org}
                scopes={scopesByOrg[org]}
                selectedScopes={selectedScopes}
                onScopeToggle={onScopeToggle}
                aggregateScopeItem={aggregateScopeItem}
              />
            );
          })}

          {orderedOrgs.length === 0 && (
            <p className="text-muted text-center py-3">{intl.formatMessage(messages['wizard.step2.scopeList.empty'])}</p>
          )}

          <div ref={loadMoreRef} />

          {isFetchingNextPage && (
            <div className="d-flex justify-content-center py-2">
              <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages['wizard.step2.scopeList.loadingMore'])} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScopeList;
