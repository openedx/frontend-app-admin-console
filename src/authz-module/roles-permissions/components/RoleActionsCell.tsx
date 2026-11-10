import { useIntl } from '@openedx/frontend-base';
import {
  Dropdown, Icon, IconButton, Stack,
} from '@openedx/paragon';
import { Edit, MoreVert, Visibility } from '@openedx/paragon/icons';

import { isCustomRole } from '@src/authz-module/catalog';
import messages from '@src/authz-module/roles-permissions/messages';
import { useRoleAssignment } from '@src/authz-module/roles-permissions/RoleAssignmentContext';
import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

/**
 * Built-in roles can only be viewed; custom roles can be edited. Every role has the overflow menu.
 * "Assign role" opens the wizard with the row's role preselected, and is hidden when the user
 * cannot assign that role.
 * Each label names the role, since react-bootstrap names the menu after its toggle and a screen
 * reader user moving through the table must tell the rows apart.
 *
 * TODO: the view (eye), edit (pencil) and "Duplicate" actions render without handlers; they
 * will be wired in a follow-up ticket.
 */
const RoleActionsCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  const { canAssignRole, assignRole } = useRoleAssignment();
  const isCustom = isCustomRole(row.original);
  const labelValues = { role: row.original.displayName };
  return (
    <Stack direction="horizontal" gap={2} className="justify-content-center">
      <IconButton
        src={isCustom ? Edit : Visibility}
        iconAs={Icon}
        variant="primary"
        className="roles-table-action-button"
        size="sm"
        alt={formatMessage(messages[isCustom ? 'authz.roles.table.action.edit.alt' : 'authz.roles.table.action.view.alt'], labelValues)}
      />
      <Dropdown drop="right">
        <Dropdown.Toggle
          id={`role-actions-${row.original.role}`}
          as={IconButton}
          src={MoreVert}
          iconAs={Icon}
          variant="dark"
          size="sm"
          alt={formatMessage(messages['authz.roles.table.action.more.alt'], labelValues)}
        />
        {/* Fixed positioning lets the menu escape the table container's overflow clipping. */}
        <Dropdown.Menu className="border-0 rounded shadow py-3" popperConfig={{ strategy: 'fixed' }}>
          <Dropdown.Item className="px-4 py-2">{formatMessage(messages['authz.roles.table.action.duplicate'])}</Dropdown.Item>
          {canAssignRole(row.original) && (
            <Dropdown.Item as="button" className="px-4 py-2" onClick={() => assignRole(row.original)}>
              {formatMessage(messages['authz.roles.table.action.assign'])}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </Stack>
  );
};

export default RoleActionsCell;
