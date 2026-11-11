import { useMemo, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { LocationOn } from '@openedx/paragon/icons';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { useScopes } from '@src/authz-module/data/hooks';
import { DEFAULT_FILTER_PAGE_SIZE, getScopeType, SCOPE_TYPES } from '@src/authz-module/constants';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import messages from '@src/authz-module/components/messages';

type ScopesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const ScopesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: ScopesFilterProps) => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { isCourseViewAllowed } = useViewTeamPermissions();
  const { isCourseEnabled } = useCourseAuthoringFlag();

  const { data: scopesData } = useScopes({
    search: searchValue,
    pageSize: DEFAULT_FILTER_PAGE_SIZE,
    ...(isCourseViewAllowed ? {} : { scopeType: SCOPE_TYPES.LIBRARY }),
  });

  const filterChoices = useMemo(() => (scopesData?.pages?.flatMap((p) => p.results) ?? [])
    // Libraries are always available; courses only when the authoring flag is enabled for them.
    .filter((scope) => getScopeType(scope.externalKey) === SCOPE_TYPES.LIBRARY || isCourseEnabled(scope.externalKey))
    .map((scope) => {
      const groupName = getScopeType(scope.externalKey) === SCOPE_TYPES.LIBRARY
        ? formatMessage(messages['authz.team.members.table.group.libraries'])
        : formatMessage(messages['authz.team.members.table.group.courses']);
      return {
        displayName: scope.displayName,
        value: scope.externalKey,
        description: scope.org?.shortName,
        groupName,
        groupIcon: getScopeResourceIcon(scope.externalKey),
      };
    }), [scopesData?.pages, formatMessage, isCourseEnabled]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <MultipleChoiceFilter
      filterButtonText={filterButtonText}
      filterChoices={filterChoices}
      filterValue={filterValue}
      setFilter={setFilter}
      isSearchable
      isGrouped
      onSearchChange={handleSearchChange}
      iconSrc={LocationOn}
      disabled={disabled}
    />
  );
};

export default ScopesFilter;
