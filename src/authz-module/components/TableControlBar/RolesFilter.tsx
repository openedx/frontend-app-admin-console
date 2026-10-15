import { ComponentType, useMemo } from 'react';
import { useIntl } from '@openedx/frontend-base';
import type { MessageDescriptor } from '@openedx/frontend-base';
import { Person } from '@openedx/paragon/icons';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { RESOURCE_ICONS } from '@src/authz-module/components/constants';
import messages from '@src/authz-module/components/messages';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { FilterChoice, MultipleChoiceFilterProps } from './types';

type RolesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

// Group shown for the roles of each scope type.
const SCOPE_TYPE_GROUPS: Partial<Record<string, { message: MessageDescriptor; icon: ComponentType }>> = {
  [SCOPE_TYPES.COURSE]: { message: messages['authz.team.members.table.group.courses'], icon: RESOURCE_ICONS.COURSE },
  [SCOPE_TYPES.LIBRARY]: { message: messages['authz.team.members.table.group.libraries'], icon: RESOURCE_ICONS.LIBRARY },
};

const RolesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: RolesFilterProps) => {
  const intl = useIntl();
  // The catalog only holds the scope types the user can view.
  const { scopeTypes, getScopeCatalog, isLoading } = useAuthzCatalog();
  const { isCourseAuthoringEnabled, isLoading: isFlagLoading } = useCourseAuthoringFlag();

  const rolesOptions = useMemo<FilterChoice[]>(() => {
    if (isLoading || isFlagLoading) return [];
    return scopeTypes
      // Authoring (course) roles also require the course-authoring flag.
      .filter((scopeType) => scopeType !== SCOPE_TYPES.COURSE || isCourseAuthoringEnabled)
      .flatMap((scopeType) => {
        const group = SCOPE_TYPE_GROUPS[scopeType];
        const groupName = group ? intl.formatMessage(group.message) : scopeType;
        return (getScopeCatalog(scopeType)?.roles ?? []).map((role) => ({
          groupName,
          groupIcon: group?.icon,
          displayName: role.displayName,
          value: role.role,
        }));
      });
  }, [intl, scopeTypes, getScopeCatalog, isCourseAuthoringEnabled, isLoading, isFlagLoading]);

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
