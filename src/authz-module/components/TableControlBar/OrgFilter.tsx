import React, { useMemo } from 'react';
import { Business } from '@openedx/paragon/icons';
import { useOrgs } from '@src/authz-module/data/hooks';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { DEFAULT_FILTER_PAGE_SIZE } from '@src/authz-module/constants';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';

type OrgFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const OrgFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: OrgFilterProps) => {
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);
  const { isLibraryViewAllowed, isLoading } = useViewTeamPermissions();
  const { isOrgAuthoringEnabled, isLoading: isFlagLoading } = useCourseAuthoringFlag();
  const {
    data: orgsData = {
      count: 0, next: null, previous: null, results: [],
    },
  } = useOrgs(searchValue, 1, DEFAULT_FILTER_PAGE_SIZE);

  // Users with library access (including those with both library and course roles) must
  // always see all orgs: library access is not gated by the course-authoring flag,
  // so the flag must never be used to filter orgs for them. Only filter orgs by the
  // flag for course-only users, and never while permissions or flag states are loading.
  const filterByAuthoringFlag = !isLoading && !isFlagLoading && !isLibraryViewAllowed;

  const filterChoices = useMemo(() => (orgsData?.results ?? [])
    .filter((org) => !filterByAuthoringFlag || isOrgAuthoringEnabled(org.shortName))
    .map((org) => ({
      displayName: org.name,
      value: org.shortName,
    })), [orgsData, filterByAuthoringFlag, isOrgAuthoringEnabled]);

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
