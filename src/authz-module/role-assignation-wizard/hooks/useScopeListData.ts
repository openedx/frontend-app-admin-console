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

  const scopesByOrg = useMemo(() => allScopes
    .filter((s: Scope) => !!s.org)
    .reduce<Record<string, Scope[]>>((acc, scope: Scope) => {
      const orgSlug = scope.org!.shortName;
      if (!acc[orgSlug]) { acc[orgSlug] = []; }
      acc[orgSlug].push(scope);
      return acc;
    }, {}), [allScopes]);

  const orderedOrgs = useMemo(() => Object.keys(scopesByOrg), [scopesByOrg]);

  const aggregateDescription = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.description.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.description.library']);

  const platformAggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.library']);

  // Only show platform aggregate and org aggregates for administrators
  const user = getAuthenticatedUser();
  const isPlatformAdmin = user?.administrator === true;

  const platformAggregateScopeItem: Scope | null = (contextType && isPlatformAdmin)
    ? {
      externalKey: '*',
      displayName: platformAggregateLabel,
      description: aggregateDescription,
      org: null,
    }
    : null;

  // Also control whether org aggregates are shown - only for admins
  const showOrgAggregates = isPlatformAdmin;

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
  };
};

export default useScopeListData;
