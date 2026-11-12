import { useIntl } from '@openedx/frontend-base';
import { Icon, Stack } from '@openedx/paragon';

import { RESOURCE_TYPE_DISPLAY } from '../constants';
import type { RoleCellProps } from '../types';

/**
 * One pill per resource type of the role; an unknown scope type shows its raw value without an
 * icon. Roles hold a single resource type today, so this is one pill until multi-type roles exist.
 */
const ResourceTypeCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  return (
    <Stack direction="horizontal" gap={1} className="flex-wrap">
      {row.original.resourceTypes.map((resourceType) => {
        const display = RESOURCE_TYPE_DISPLAY[resourceType];
        return (
          <span
            key={resourceType}
            className="d-inline-flex align-items-center rounded-pill bg-info-100 text-info-500 px-2 py-1"
          >
            {display && <Icon src={display.icon} size="xs" className="mr-2" />}
            {display ? formatMessage(display.label) : resourceType}
          </span>
        );
      })}
    </Stack>
  );
};

export default ResourceTypeCell;
