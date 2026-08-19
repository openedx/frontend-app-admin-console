import { useMemo, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { LocationOn } from '@openedx/paragon/icons';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { useScopes } from '@src/authz-module/data/hooks';
import { DEFAULT_FILTER_PAGE_SIZE } from '@src/authz-module/constants';
import { MultipleChoiceFilterProps } from './types';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { RESOURCE_ICONS } from '@src/authz-module/components/constants';
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
    ...(isCourseViewAllowed ? {} : { scopeType: 'library' }),
  });

  const filterChoices = useMemo(() => (scopesData?.pages?.flatMap((p) => p.results) ?? [])
    // Libraries are always available; courses only when the authoring flag is enabled for them.
    .filter((scope) => scope.externalKey?.startsWith('lib') || isCourseEnabled(scope.externalKey))
    .map((scope) => {
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
