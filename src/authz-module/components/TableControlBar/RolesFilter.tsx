import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Person } from '@openedx/paragon/icons';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { CONTEXT_TYPES } from '@src/authz-module/constants';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { MultipleChoiceFilterProps } from './types';
import { getRolesFiltersOptions } from '../constants';

type RolesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const RolesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: RolesFilterProps) => {
  const intl = useIntl();
  const { isCourseViewAllowed, isLibraryViewAllowed, isLoading } = useViewTeamPermissions();

  const rolesOptions = useMemo(() => {
    if (isLoading) { return []; }
    return getRolesFiltersOptions(intl).filter((option) => {
      if (option.contextType === CONTEXT_TYPES.COURSE) { return isCourseViewAllowed; }
      if (option.contextType === CONTEXT_TYPES.LIBRARY) { return isLibraryViewAllowed; }
      return false;
    });
  }, [intl, isCourseViewAllowed, isLibraryViewAllowed, isLoading]);
  return (
    <MultipleChoiceFilter
      filterButtonText={filterButtonText}
      filterChoices={rolesOptions}
      filterValue={filterValue}
      setFilter={setFilter}
      isGrouped
      iconSrc={Person}
      disabled={disabled}
    />
  );
};

export default RolesFilter;
