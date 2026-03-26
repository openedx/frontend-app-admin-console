import React, { useMemo } from 'react';
import { LocationOn } from '@openedx/paragon/icons';
import { useScopes } from '@src/authz-module/data/hooks';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';

type ScopesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const ScopesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: ScopesFilterProps) => {
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);
  const { data: scopesData = { scopes: [] } } = useScopes(searchValue);

  const filterChoices = useMemo(() => scopesData.scopes.map((scope) => ({
    displayName: scope.name,
    value: scope.key,
    groupName: scope.organization.name,
  })), [scopesData]);

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
