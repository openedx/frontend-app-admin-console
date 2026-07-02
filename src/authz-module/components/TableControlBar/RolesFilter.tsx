import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Person } from '@openedx/paragon/icons';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, MANAGE_TEAM_PERMISSIONS } from '@src/authz-module/roles-permissions';
import { CONTEXT_TYPES } from '@src/authz-module/constants';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { MultipleChoiceFilterProps } from './types';
import { getRolesFiltersOptions } from '../constants';

type RolesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const RolesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: RolesFilterProps) => {
  const intl = useIntl();
  const { data: permissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);

  // Only show role groups for the domains the user can view. Global roles stay
  // hidden until a platform-wide permission is available to gate them on.
  const allowedContexts = useMemo(() => {
    const contexts = new Set<string>();
    permissions?.forEach((p) => {
      if (!p.allowed) { return; }
      if (p.action === CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM) { contexts.add(CONTEXT_TYPES.LIBRARY); }
      if (p.action === CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM) { contexts.add(CONTEXT_TYPES.COURSE); }
    });
    return contexts;
  }, [permissions]);

  const rolesOptions = useMemo(
    () => getRolesFiltersOptions(intl).filter((option) => allowedContexts.has(option.contextType)),
    [intl, allowedContexts],
  );
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
