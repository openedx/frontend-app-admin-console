import {
  courseResourceTypes,
  coursePermissions,
  rolesObject,
  DJANGO_MANAGED_ROLES,
} from '@src/authz-module/constants';
import {
  libraryResourceTypes,
  libraryPermissions,
  rolesLibraryObject,
} from '@src/authz-module/roles-permissions/library/constants';
import RenderPermissionColumn, { type PermissionItem } from './RenderPermissionColumn';
import RenderPermissionInLine from './RenderPermissionInLine';
import RenderAdminRole from './RenderAdminRole';

interface UserPermissionsProps {
  row: {
    original: {
      role: string;
    };
  };
}

const UserPermissions = ({ row }: UserPermissionsProps) => {
  let roleKey = row?.original?.role;
  if (!roleKey) { return null; }

  if (DJANGO_MANAGED_ROLES.includes(roleKey)) {
    return (
      <div className="d-flex flex-wrap bg-white px-4 py-4 border border-light">
        <RenderAdminRole role={roleKey} />
      </div>
    );
  }

  // Normalize role string to match keys in constants (e.g. "Course Admin" -> "course_admin")
  roleKey = roleKey.trim().toLowerCase().replace(/[-\s]+/g, '_');
  const isLibraryRole = roleKey.includes('library');
  const config = isLibraryRole
    ? {
      resourceTypes: libraryResourceTypes,
      permissions: libraryPermissions,
      roles: rolesLibraryObject,
    }
    : {
      resourceTypes: courseResourceTypes,
      permissions: coursePermissions,
      roles: rolesObject,
    };

  const roleObj = config.roles.find(r => r.role === roleKey);
  if (!roleObj) { return null; }

  const rolePerms = new Set(roleObj.permissions.map(String));
  // Build resource list with permissions (only once)
  const resources = config.resourceTypes
    .map(resource => {
      const perms = config.permissions.filter(
        p => p.resource === resource.key && rolePerms.has(String(p.key)),
      );
      return perms.length ? { ...resource, perms } : null;
    })
    .filter((r): r is PermissionItem => r !== null);

  const isSingleRow = resources.length <= 3;
  const mid = Math.ceil(resources.length / 2);
  const columns = isSingleRow
    ? [resources]
    : [resources.slice(0, mid), resources.slice(mid)];
  return (
    <div className="d-flex flex-wrap bg-white px-4 py-4 border border-light-200">
      {isSingleRow
        ? <RenderPermissionInLine items={resources} />
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
