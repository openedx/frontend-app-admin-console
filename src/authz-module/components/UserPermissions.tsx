import { useIntl } from '@openedx/frontend-base';
import { DJANGO_MANAGED_ROLES } from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import type { CategoryPermissions } from '@src/authz-module/catalog';
import { buildPermissionMatrix } from '@src/authz-module/roles-permissions';
import RenderPermissionColumn from './RenderPermissionColumn';
import RenderPermissionInline from './RenderPermissionInline';
import RenderAdminRole from './RenderAdminRole';
import messages from './messages';

// Category of the permissions the catalog sends without one.
const OTHER_CATEGORY_ID = 'other';

interface UserPermissionsProps {
  row: {
    original: {
      role: string;
      scope?: string;
    };
  };
}

const UserPermissions = ({ row }: UserPermissionsProps) => {
  const intl = useIntl();
  const { scopeTypes, getScopeCatalog } = useAuthzCatalog();
  let roleKey = row?.original?.role;
  if (!roleKey) return null;

  if (DJANGO_MANAGED_ROLES.includes(roleKey)) {
    return (
      <div className="d-flex flex-wrap bg-white px-4 py-4 border border-light">
        <RenderAdminRole role={roleKey} />
      </div>
    );
  }

  // Normalize role string to match the catalog role ids (e.g. "Course Admin" -> "course_admin")
  roleKey = roleKey.trim().toLowerCase().replace(/[-\s]+/g, '_');

  // The assignment scope key starts with its scope type (e.g. `lib:` or `course-v1:`), so that scope
  // type's catalog is preferred; otherwise, any scope type that has the role.
  const assignmentScopeType = row.original.scope?.split(':')[0] ?? '';
  const scopeCatalog = [assignmentScopeType, ...scopeTypes]
    .map(getScopeCatalog)
    .find((catalog) => catalog?.roles.some(({ role }) => role === roleKey));
  if (!scopeCatalog) return null;

  const otherCategory = {
    id: OTHER_CATEGORY_ID,
    displayName: intl.formatMessage(messages['authz.tabs.permissionsRoles.category.other']),
    description: '',
    icon: null,
  };
  // The role's permissions grouped by category, in the same order as the roles and permissions matrix.
  const categories: CategoryPermissions[] = buildPermissionMatrix(scopeCatalog, otherCategory)
    .map(({ category, permissions }) => ({
      category,
      permissions: permissions.filter(({ grantedTo }) => grantedTo[roleKey]).map(({ permission }) => permission),
    }))
    .filter(({ permissions }) => permissions.length > 0);

  const isSingleRow = categories.length <= 3;
  const mid = Math.ceil(categories.length / 2);
  const columns = isSingleRow
    ? [categories]
    : [categories.slice(0, mid), categories.slice(mid)];
  return (
    <div className="d-flex flex-wrap bg-white px-4 py-4 border border-light-200">
      {isSingleRow
        ? <RenderPermissionInline items={categories} />
        : (
            <div className="d-flex flex-wrap w-100">
              {columns.map((col, index) => (
                <div
                  key={`column-${index === 0 ? 'left' : 'right'}`}
                  className={`position-relative w-100 col-md-12 col-xl-6 py-3 ${
                    index === 0 ? 'pr-md-3' : 'pl-md-4'
                  }`}
                >
                  <RenderPermissionColumn items={col} />
                  {index === 0 && (
                    <div className="d-none d-xl-block position-absolute border-right h-100" style={{ right: 0, top: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export default UserPermissions;
