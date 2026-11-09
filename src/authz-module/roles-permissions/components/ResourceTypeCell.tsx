import { useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';

import { RESOURCE_TYPE_DISPLAY } from '../constants';
import type { RoleCellProps } from '../types';

/** Resource type pill; an unknown scope type shows its raw value without an icon. */
const ResourceTypeCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  const { resourceType } = row.original;
  const display = RESOURCE_TYPE_DISPLAY[resourceType];
  return (
    <span className="d-inline-flex align-items-center rounded-pill bg-info-100 text-info-500 px-2 py-1">
      {display && <Icon src={display.icon} size="xs" className="mr-2" />}
      {display ? formatMessage(display.label) : resourceType}
    </span>
  );
};

export default ResourceTypeCell;
