import {
  courseResourceTypes,
  coursePermissions,
  rolesObject,
} from '../courses/constant';
import {
  libraryResourceTypes,
  libraryPermissions,
  rolesLibraryObject,
} from '../libraries/constants';
import RenderPermissionColumn from './RenderPermissionColumn';
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

  // validation to show django roles
  const normalizedRole = roleKey.trim().toLowerCase();
  if (!normalizedRole.includes('library') && !normalizedRole.includes('course')
    && (normalizedRole.includes('admin') || normalizedRole.includes('staff'))) {
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
    .filter(Boolean);

  const isSingleRow = resources.length <= 3;
  const mid = Math.ceil(resources.length / 2);
  const columns = isSingleRow
    ? [resources]
    : [resources.slice(0, mid), resources.slice(mid)];
  return (
    <div className="d-flex flex-wrap bg-white px-4 py-4 border border-info-200">
      {isSingleRow
        ? <RenderPermissionInLine items={resources} />
        : columns.map((col, index) => (
          <div
            key={`column-${index === 0 ? 'left' : 'right'}`}
            className={`w-100 w-md-50 py-3 ${
              index === 0 ? 'pr-md-3 border-right' : 'pl-md-4'
            }`}
          >
            <RenderPermissionColumn items={col} />
          </div>
        ))}
    </div>
  );
};

export default UserPermissions;
