import { useEffect, useRef } from 'react';
import { Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Org, Scope } from 'types';
import OrgSection from './OrgSection';
import ScopeCheckboxItem from './ScopeCheckboxItem';
import messages from '../messages';

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
  orgAggregateScopeItems: Record<string, Scope>;
}

const ScopeList = ({
  orderedOrgs,
  scopesByOrg,
  organizations,
  selectedScopes,
  onScopeToggle,
  queryState,
  platformAggregateScopeItem,
  orgAggregateScopeItems,
}: ScopeListProps) => {
  const intl = useIntl();
  const {
    isLoading, isFetchingNextPage, hasNextPage, isError, fetchNextPage,
  } = queryState;
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
    <div className="scope-list border rounded p-3 bg-light-100 overflow-auto">
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

          {orderedOrgs.map((org) => (
            <OrgSection
              key={org}
              orgName={organizations?.find((o) => o.shortName === org)?.name || org}
              scopes={scopesByOrg[org]}
              selectedScopes={selectedScopes}
              onScopeToggle={onScopeToggle}
              aggregateScopeItem={orgAggregateScopeItems[org]}
            />
          ))}

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
