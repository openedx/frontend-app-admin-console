import { useMemo } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Scope } from '@src/types';
import { useOrgs, useScopes } from '@src/authz-module/data/hooks';
import messages from '../messages';

interface UseScopeListDataParams {
  contextType: string | undefined;
  search: string;
  org: string;
}

const groupByOrg = (acc: Record<string, Scope[]>, scope: Scope): Record<string, Scope[]> => {
  const orgSlug = scope.org!.shortName;
  if (!acc[orgSlug]) { acc[orgSlug] = []; }
  acc[orgSlug].push(scope);
  return acc;
};

const useScopeListData = ({ contextType, search, org }: UseScopeListDataParams) => {
  const intl = useIntl();
  const {
    data: scopesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useScopes({
    scopeType: contextType,
    search: search || undefined,
    org: org || undefined,
  });

  const { data: orgsData } = useOrgs();
  const organizations = orgsData?.results;

  const allScopes = useMemo(
    () => scopesData?.pages.flatMap((page) => page.results) ?? [],
    [scopesData],
  );

  const totalCount = scopesData?.pages[0]?.count ?? 0;

  const scopesByOrg = useMemo(
    () => allScopes
      .filter((s: Scope) => !!s.org)
      .reduce<Record<string, Scope[]>>(groupByOrg, {}),
    [allScopes],
  );

  const orderedOrgs = useMemo(() => Object.keys(scopesByOrg).sort(), [scopesByOrg]);

  const aggregateDescription = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.description.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.description.library']);

  const platformAggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.library']);

  const orgAggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.course'])
    : intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.library']);

  // Only show platform aggregate and org aggregates for administrators.
  // getAuthenticatedUser() is stable for the lifetime of a session (no hot user-switching).
  const isPlatformAdmin = useMemo(
    () => getAuthenticatedUser()?.administrator === true,
    [],
  );

  const platformAggregateScopeItem: Scope | null = (contextType && isPlatformAdmin)
    ? {
      externalKey: '*',
      displayName: platformAggregateLabel,
      description: aggregateDescription,
      org: null,
    }
    : null;

  const showOrgAggregates = isPlatformAdmin;

  const orgAggregateScopeItems = useMemo<Record<string, Scope>>(() => {
    if (!contextType || !showOrgAggregates) { return {}; }
    return Object.fromEntries(
      orderedOrgs.map((orgSlug) => [
        orgSlug,
        {
          externalKey: contextType === 'course' ? `course-v1:${orgSlug}+*` : `lib:${orgSlug}:*`,
          displayName: orgAggregateLabel,
          description: aggregateDescription,
          org: { id: '0', name: orgSlug, shortName: orgSlug },
        } satisfies Scope,
      ]),
    );
  }, [orderedOrgs, contextType, showOrgAggregates, orgAggregateLabel, aggregateDescription]);

  return {
    organizations,
    orderedOrgs,
    scopesByOrg,
    allScopes,
    totalCount,
    queryState: {
      isLoading, isFetchingNextPage, hasNextPage, isError, fetchNextPage,
    },
    platformAggregateScopeItem,
    showOrgAggregates,
    orgAggregateScopeItems,
  };
};

export default useScopeListData;
