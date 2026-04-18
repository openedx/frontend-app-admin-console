import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Person } from '@openedx/paragon/icons';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { MultipleChoiceFilterProps } from './types';
import { getRolesFiltersOptions } from '../constants';

type RolesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const RolesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: RolesFilterProps) => {
  const intl = useIntl();
  const rolesOptions = useMemo(() => getRolesFiltersOptions(intl), [intl]);
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
