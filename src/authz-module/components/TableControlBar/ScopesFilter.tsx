import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { LocationOn } from '@openedx/paragon/icons';
import { useScopes } from '@src/authz-module/data/hooks';
import { DEFAULT_FILTER_PAGE_SIZE, getScopeContextType } from '@src/authz-module/constants';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { RESOURCE_ICONS } from '../constants';
import messages from '../messages';

type ScopesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const ScopesFilter = ({
  filterId, filterButtonText, filterValue, setFilter, disabled,
}: ScopesFilterProps) => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const { data: scopesData } = useScopes({ search: searchValue, pageSize: DEFAULT_FILTER_PAGE_SIZE });

  const filterChoices = useMemo(() => (scopesData?.pages?.flatMap((p) => p.results) ?? []).map((scope) => {
    const isLibrary = getScopeContextType(scope.externalKey ?? '') === 'library';
    return {
      displayName: scope.displayName,
      value: scope.externalKey,
      description: scope.org?.shortName,
      groupName: formatMessage(messages[isLibrary
        ? 'authz.team.members.table.group.libraries'
        : 'authz.team.members.table.group.courses']),
      groupIcon: isLibrary ? RESOURCE_ICONS.LIBRARY : RESOURCE_ICONS.COURSE,
    };
  }), [scopesData?.pages, formatMessage]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <MultipleChoiceFilter
      filterId={filterId}
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
