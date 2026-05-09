import { Icon } from '@openedx/paragon';
import ResourceTooltip from './ResourceTooltip';
import type { PermissionItem } from './RenderPermissionColumn';

interface RenderPermissionInLineProps {
  items: PermissionItem[];
}

const RenderPermissionInLine = ({ items }: RenderPermissionInLineProps) => (
  <div className="d-flex align-items-start w-100 no-scroll">
    {items.map(({
      key, icon, label, description, perms,
    }, index) => (
      <div
        key={key}
        className={`d-flex flex-column ${index !== items.length - 1 ? 'pr-4 mr-4 border-right' : ''}`}
      >
        <div className="d-flex align-items-center mb-2">
          <Icon src={icon} className="mr-2 text-primary" size="xs" />
          <h5 className="text-primary m-0">{label}</h5>
          <ResourceTooltip
            resourceGroup={{
              key, label, description, permissions: perms,
            }}
          />
        </div>
        <div className="d-flex">
          {perms.map((perm, i) => (
            <div
              key={perm.key}
              className={`d-flex align-items-center ${i !== perms.length - 1 ? 'pr-2 mr-2 border-right' : ''}`}
            >
              <Icon src={perm.icon} className="mr-2" size="xs" />
              <span className="text-primary small font-weight-light">
                {perm.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
export default RenderPermissionInLine;
