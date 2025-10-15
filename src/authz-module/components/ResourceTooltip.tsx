import { Icon, OverlayTrigger, Popover } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { PermissionsResourceGrouped, RoleResourceGroup } from '@src/types';

type ResourceTooltipProps = {
  resourceGroup: PermissionsResourceGrouped | RoleResourceGroup;
};

const ResourceTooltip = ({ resourceGroup }:ResourceTooltipProps) => (
  <OverlayTrigger
    key={`overlay-${resourceGroup.key}`}
    placement="right"
    overlay={(
      <Popover variant="light" id={`tooltip-${resourceGroup.label}`}>
        <Popover.Content className="p-3">
          <h3 className="text-primary">{resourceGroup.label}</h3>
          <p>{resourceGroup.description}</p>
          <ul>
            {resourceGroup.permissions.map(permission => (
              <li><b>{permission.label.trim()}:</b> {permission.description}</li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
    )}
  >
    <Icon className="d-inline-block text-gray ml-2 my-auto" size="sm" src={Info} />
  </OverlayTrigger>
);

export default ResourceTooltip;
