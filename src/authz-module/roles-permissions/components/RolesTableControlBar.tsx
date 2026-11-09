import { useContext } from 'react';
import { useIntl } from '@openedx/frontend-base';
import {
  Button, Chip, DataTableContext, Stack,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import MultipleChoiceFilter from '../../components/TableControlBar/MultipleChoiceFilter';
import SearchFilter from '../../components/TableControlBar/SearchFilter';
import componentMessages from '../../components/messages';
import { RESOURCE_TYPE_DISPLAY } from '../constants';
import messages from '../messages';

interface RolesTableControlBarProps {
  // The scope types the user can view, offered as resource type filter choices.
  scopeTypes: string[];
}

/**
 * Search, resource type filter and applied-filter chips of the roles table. The shared
 * TableControlBar builds a "Search by X or Y" placeholder from two text columns, while this
 * table searches a single column with a plain "Search", so it has its own bar.
 *
 * TODO: the filters set react-table column filters applied client side; update them once the
 * backend API supports search and resource type filtering.
 */
const RolesTableControlBar = ({ scopeTypes }: RolesTableControlBarProps) => {
  const { formatMessage } = useIntl();
  const {
    columns, page, itemCount,
  // @ts-expect-error - Paragon's DataTableContext is not typed
  } = useContext<DataTableContext>(DataTableContext);
  const nameColumn = columns.find((column) => column.id === 'name');
  const resourceTypeColumn = columns.find((column) => column.id === 'resourceType');

  const getResourceTypeName = (scopeType: string) => {
    const label = RESOURCE_TYPE_DISPLAY[scopeType]?.label;
    return label ? formatMessage(label) : scopeType;
  };

  const resourceTypeChoices = scopeTypes.map((value) => ({ value, displayName: getResourceTypeName(value) }));

  // The filter value already keeps selections in click order, so the chips read from it
  // directly instead of mirroring it in state the way TableControlBar does.
  const appliedResourceTypes: string[] = resourceTypeColumn?.filterValue ?? [];
  const setResourceTypes = (value: string[]) => resourceTypeColumn?.setFilter(value.length ? value : undefined);
  const removeResourceType = (value: string) => setResourceTypes(appliedResourceTypes.filter((item) => item !== value));

  return (
    <div className="authz-table-control-bar pgn__data-table-status-bar">
      <Stack className="mb-2 flex-wrap" gap={2} direction="horizontal">
        <SearchFilter
          filterValue={nameColumn?.filterValue}
          setFilter={nameColumn?.setFilter}
          placeholder={formatMessage(messages['authz.roles.table.search.placeholder'])}
        />
        <MultipleChoiceFilter
          filterButtonText={formatMessage(messages['authz.roles.table.column.resource.type.title'])}
          filterChoices={resourceTypeChoices}
          filterValue={appliedResourceTypes}
          setFilter={setResourceTypes}
        />
        <span className="ml-auto small">
          {formatMessage(messages['authz.roles.table.showing.roles.text'], { pageSize: page.length, itemCount })}
        </span>
      </Stack>

      {appliedResourceTypes.length > 0 && (
        <Stack gap={1} direction="horizontal" className="flex-wrap mb-2">
          <span>{formatMessage(componentMessages['authz.table.controlbar.filterby.label'])}</span>
          {appliedResourceTypes.map((value) => (
            <Chip
              key={value}
              iconBefore={RESOURCE_TYPE_DISPLAY[value]?.icon}
              iconAfter={Close}
              iconAfterAlt={formatMessage(messages['authz.roles.table.filter.remove.alt'], { filter: getResourceTypeName(value) })}
              onIconAfterClick={() => removeResourceType(value)}
            >
              {getResourceTypeName(value)}
            </Chip>
          ))}
          {appliedResourceTypes.length > 1 && (
            <Button className="py-0" variant="link" onClick={() => setResourceTypes([])}>
              {formatMessage(componentMessages['authz.table.controlbar.clearFilters'])}
            </Button>
          )}
        </Stack>
      )}
    </div>
  );
};

export default RolesTableControlBar;
