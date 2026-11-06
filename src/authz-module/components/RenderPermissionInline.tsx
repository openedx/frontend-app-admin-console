import { CatalogIcon } from '@src/authz-module/catalog';
import type { CategoryPermissions } from '@src/authz-module/catalog';
import CategoryTooltip from './CategoryTooltip';

interface RenderPermissionInlineProps {
  items: CategoryPermissions[];
}

const RenderPermissionInline = ({ items }: RenderPermissionInlineProps) => (
  <div className="d-flex align-items-start w-100 no-scroll">
    {items.map(({ category, permissions }, index) => (
      <div
        key={category.id}
        className={`d-flex flex-column ${index !== items.length - 1 ? 'pr-4 mr-4 border-right' : ''}`}
      >
        <div className="d-flex align-items-center mb-2">
          <CatalogIcon name={category.icon} className="mr-2 text-primary" size="xs" />
          <h5 className="text-primary m-0">{category.displayName}</h5>
          <CategoryTooltip category={category} permissions={permissions} />
        </div>
        <div className="d-flex">
          {permissions.map((permission, i) => (
            <div
              key={permission.id}
              className={`d-flex align-items-center ${i !== permissions.length - 1 ? 'pr-2 mr-2 border-right' : ''}`}
            >
              <CatalogIcon name={permission.icon} className="mr-2" size="xs" />
              <span className="text-primary small font-weight-light">
                {permission.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
export default RenderPermissionInline;
