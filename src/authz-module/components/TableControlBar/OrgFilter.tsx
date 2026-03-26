import React, { useMemo } from 'react';
import { Business } from '@openedx/paragon/icons';
import { useOrgs } from '@src/authz-module/data/hooks';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';

type OrgFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const OrgFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: OrgFilterProps) => {
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);
  const { data: orgsData = { orgs: [] } } = useOrgs(searchValue);

  const filterChoices = useMemo(() => orgsData.orgs.map((org) => ({
    displayName: org.name,
    value: org.id,
  })), [orgsData]);

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
      onSearchChange={handleSearchChange}
      iconSrc={Business}
      disabled={disabled}
    />
  );
};

export default OrgFilter;
