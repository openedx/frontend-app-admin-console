import { Icon, OverlayTrigger, Popover } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { PermissionsResourceGrouped, RoleResourceGroup } from '@src/types';

type ResourceTooltipProps = {
  resourceGroup: PermissionsResourceGrouped | RoleResourceGroup;
};

const ResourceTooltip = ({ resourceGroup }:ResourceTooltipProps) => (
  <OverlayTrigger
    key={`overlay-${resourceGroup.key}`}
    placement="auto"
    overlay={(
      <Popover variant="light" id={`tooltip-${resourceGroup.label}`}>
        <Popover.Content className="p-3">
          <h4 className="text-primary">{resourceGroup.label}</h4>
          <p className="small">{resourceGroup.description}</p>
          <ul className="small">
            {resourceGroup.permissions.map(permission => (
              <li><b>{permission.label.trim()}:</b> {permission.description}</li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
    )}
  >
    <Icon className="d-inline-block text-gray ml-2 my-auto" size="inline" src={Info} />
  </OverlayTrigger>
);

export default ResourceTooltip;
