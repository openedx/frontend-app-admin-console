import { CatalogIcon } from '@src/authz-module/catalog';
import type { CategoryPermissions } from '@src/authz-module/catalog';
import CategoryTooltip from './CategoryTooltip';

interface RenderPermissionColumnProps {
  items: CategoryPermissions[];
}

const RenderPermissionColumn = ({ items }: RenderPermissionColumnProps) => (
  <>
    {items.map(({ category, permissions }) => (
      <div key={category.id} className="mb-4 col-12">
        <div className="d-flex align-items-center mb-2">
          <CatalogIcon name={category.icon} className="mr-2 text-primary" size="xs" />
          <h5 className="text-primary m-0">{category.displayName}</h5>
          <CategoryTooltip category={category} permissions={permissions} />
        </div>
        <ul className="mb-0 list-unstyled d-flex align-items-center">
          {permissions.map((permission, index) => (
            <li
              key={permission.id}
              className={`d-flex align-items-center text-primary-400 ${index !== permissions.length - 1 ? 'border-right pr-2' : ''
              } ${index !== 0 ? 'pl-2' : ''}`}
            >
              <CatalogIcon name={permission.icon} className="mr-2" size="xs" />
              <span className="text-primary small font-weight-light">
                {permission.displayName}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </>
);

export default RenderPermissionColumn;
