import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Scope } from '@src/types';
import { useOrgs, useScopes } from '@src/authz-module/data/hooks';
import { getOrgAggregateScopeKey } from '@src/authz-module/constants';
import messages from '../messages';
import useScopePermissions from './useScopePermissions';

interface UseScopeListDataParams {
  contextType: string | undefined;
  search: string;
  orgs: string[];
}

const groupByOrg = (acc: Record<string, Scope[]>, scope: Scope): Record<string, Scope[]> => {
  const orgSlug = scope.org!.shortName;
  if (!acc[orgSlug]) { acc[orgSlug] = []; }
  acc[orgSlug].push(scope);
  return acc;
};

const useScopeListData = ({ contextType, search, orgs }: UseScopeListDataParams) => {
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
    orgs: orgs.length ? orgs : undefined,
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

  const { hasPlatformPermission, orgHasPermission } = useScopePermissions({ contextType, orderedOrgs });

  const aggregateDescription = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.description.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.description.library']);

  const platformAggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.course'])
    : intl.formatMessage(messages['wizard.step2.scope.aggregate.platform.label.library']);

  const orgAggregateLabel = contextType === 'course'
    ? intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.course'])
    : intl.formatMessage(messages['wizard.step2.scopeList.aggregate.label.library']);

  const platformAggregateScopeItem: Scope | null = (contextType && hasPlatformPermission)
    ? {
      externalKey: '*',
      displayName: platformAggregateLabel,
      description: aggregateDescription,
      org: null,
    }
    : null;

  /**
   * Builds a map of org-level aggregate scopes keyed by org slug.
   *
   * Each entry represents a wildcard scope that grants access to all courses or
   * libraries within an org (e.g. `course-v1:OrgSlug+*` or `lib:OrgSlug:*`).
   * Only orgs where the current user already holds permission are included.
   *
   * Returns an empty object when `contextType` is not yet defined.
   */
  const orgAggregateScopeItems = useMemo<Record<string, Scope>>(() => {
    if (!contextType) { return {}; }
    return Object.fromEntries(
      orderedOrgs
        .filter((orgSlug) => orgHasPermission[orgSlug])
        .map((orgSlug) => [
          orgSlug,
          {
            externalKey: getOrgAggregateScopeKey(contextType, orgSlug),
            displayName: orgAggregateLabel,
            description: aggregateDescription,
            org: { id: '0', name: orgSlug, shortName: orgSlug },
          } satisfies Scope,
        ]),
    );
  }, [orderedOrgs, contextType, orgHasPermission, orgAggregateLabel, aggregateDescription]);

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
    orgAggregateScopeItems,
  };
};

export default useScopeListData;
