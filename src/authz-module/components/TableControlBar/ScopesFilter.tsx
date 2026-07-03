import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { LocationOn } from '@openedx/paragon/icons';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, VIEW_TEAM_PERMISSIONS } from '@src/authz-module/roles-permissions';
import { useScopes } from '@src/authz-module/data/hooks';
import { DEFAULT_FILTER_PAGE_SIZE } from '@src/authz-module/constants';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { RESOURCE_ICONS } from '../constants';
import messages from '../messages';

type ScopesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const ScopesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: ScopesFilterProps) => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { data: permissions } = useValidateUserPermissionsNonSuspense(VIEW_TEAM_PERMISSIONS);
  const isCourseViewAllowed = permissions
    ? permissions.some((p) => p.action === CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM && p.allowed)
    : true;

  const { data: scopesData } = useScopes({
    search: searchValue,
    pageSize: DEFAULT_FILTER_PAGE_SIZE,
    ...(isCourseViewAllowed ? {} : { scopeType: 'library' }),
  });

  const filterChoices = useMemo(() => (scopesData?.pages?.flatMap((p) => p.results) ?? []).map((scope) => {
    const scopeIcon = scope.externalKey?.startsWith('lib') ? RESOURCE_ICONS.LIBRARY : RESOURCE_ICONS.COURSE;
    let groupName = formatMessage(messages['authz.team.members.table.group.courses']);
    if (scope.externalKey?.startsWith('lib')) {
      groupName = formatMessage(messages['authz.team.members.table.group.libraries']);
    }
    return {
      displayName: scope.displayName,
      value: scope.externalKey,
      description: scope.org?.shortName,
      groupName,
      groupIcon: scopeIcon,
    };
  }), [scopesData?.pages, formatMessage]);

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
