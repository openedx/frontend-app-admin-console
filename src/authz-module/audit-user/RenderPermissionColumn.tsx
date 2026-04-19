import { Icon } from '@openedx/paragon';
import { RolePermission } from 'types';
import ResourceTooltip from '../components/ResourceTooltip';

interface ExtendedRolePermission extends RolePermission {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PermissionItem {
  key: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  perms: ExtendedRolePermission[];
}

interface RenderPermissionColumnProps {
  items: PermissionItem[];
}

const RenderPermissionColumn = ({ items }: RenderPermissionColumnProps) => items.map(({
  key, icon, label, description, perms,
}) => (
  <div key={key} className="mb-4">
    <div className="d-flex align-items-center mb-2">
      <Icon src={icon} className="mr-2 text-primary" size="xs" />
      <h5 className="text-primary m-0">{label}</h5>
      <ResourceTooltip
        resourceGroup={{
          key, label, description, permissions: perms,
        }}
      />
    </div>
    <ul className="mb-0 list-unstyled d-flex">
      {perms.map((perm, index) => (
        <li
          key={perm.key}
          className={`d-flex align-items-center text-primary-400 ${index !== perms.length - 1 ? 'border-right pr-2' : ''
          } ${index !== 0 ? 'pl-2' : ''}`}
        >
          <Icon src={perm.icon} className="mr-2" size="xs" />
          <span className="text-primary small font-weight-light">
            {perm.label}
          </span>
        </li>
      ))}
    </ul>
  </div>
));

export default RenderPermissionColumn;
