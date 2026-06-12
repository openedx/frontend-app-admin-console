import { Icon, OverlayTrigger, Popover } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { PermissionMetadata } from '@src/types';

type ResourceTooltipProps = {
  resourceGroup: {
    key: string;
    label: string;
    description: string;
    permissions: PermissionMetadata[];
  };
};

const ResourceTooltip = ({ resourceGroup }:ResourceTooltipProps) => (
  <OverlayTrigger
    key={`overlay-${resourceGroup.key}`}
    placement="auto"
    overlay={(
      <Popover id={`tooltip-${resourceGroup.label}`}>
        <Popover.Content className="p-3">
          <h4 className="text-primary">{resourceGroup.label}</h4>
          <p className="small">{resourceGroup.description}</p>
          <ul className="small">
            {resourceGroup.permissions.map(permission => (
              <li key={permission.key}><b>{permission.label?.trim() ?? ''}:</b> {permission.description}</li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
    )}
  >
    <Icon className="d-inline-block text-gray-300 ml-2 my-auto" src={Info} />
  </OverlayTrigger>
);

export default ResourceTooltip;
