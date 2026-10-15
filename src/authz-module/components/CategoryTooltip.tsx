import { Icon, OverlayTrigger, Popover } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import type { Category, Permission } from '@src/authz-module/catalog';

interface CategoryTooltipProps {
  category: Category;
  permissions: Permission[];
}

const CategoryTooltip = ({ category, permissions }: CategoryTooltipProps) => (
  <OverlayTrigger
    key={`overlay-${category.id}`}
    placement="auto"
    overlay={(
      <Popover id={`tooltip-${category.id}`}>
        <Popover.Content className="p-3">
          <h4 className="text-primary">{category.displayName}</h4>
          <p className="small">{category.description}</p>
          <ul className="small">
            {permissions.map(permission => (
              <li key={permission.id}><b>{permission.displayName}:</b> {permission.description}</li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
    )}
  >
    <Icon className="d-inline-block text-gray-300 ml-2 my-auto" src={Info} size="sm" />
  </OverlayTrigger>
);

export default CategoryTooltip;
