import { Icon } from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import { RESOURCE_ICONS } from './components/constants';
import { DJANGO_MANAGED_ROLES } from './constants';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from './roles-permissions';

/**
 * Returns a header value for a DataTable column that shows a filter icon
 * when the column has an active filter.
 *
 * When a filter is active, returns a **component function** with a custom
 * toString() override. This is necessary because Paragon's TableRow builds
 * cell keys via: `${cell.column.Header}${row.id}`
 *
 * - A JSX element stringifies to "[object Object]", causing duplicate keys.
 * - A function with a custom toString() produces a unique string per column.
 *
 * react-table's render('Header') calls the function as a component, so the
 * JSX is still rendered correctly in the table header.
 */
export const getCellHeader = (columnId: string, columnTitle: string, filtersApplied: string[]) => {
  if (filtersApplied.includes(columnId)) {
    const FilteredHeader = () => (
      <span className="d-flex flex-row align-items-center">
        <Icon src={FilterList} size="sm" className="mr-2" />
        {columnTitle}
      </span>
    );
    FilteredHeader.displayName = `FilteredHeader_${columnId}`;
    FilteredHeader.toString = () => `FilteredHeader_${columnId}`;
    return FilteredHeader;
  }
  return columnTitle;
};

/**
 * Picks the resource icon for a scope from the role that grants it: Django-managed roles
 * are platform-wide, `lib*` roles point at libraries, and everything else at courses.
 */
export const getScopeResourceIcon = (role: string) => {
  if (DJANGO_MANAGED_ROLES.includes(role)) {
    return RESOURCE_ICONS.GLOBAL;
  }
  return role?.startsWith('lib') ? RESOURCE_ICONS.LIBRARY : RESOURCE_ICONS.COURSE;
};

export const getScopeManageAction = (scope: string) => {
  if (scope.startsWith('lib')) {
    return CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;
  }
  if (scope.startsWith('course')) {
    return CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM;
  }
  // Default fallback or throw error for unknown scopes
  return CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM;
};

export const getScopeManageActionPermission = (scope: string) => {
  const action = getScopeManageAction(scope);
  return {
    action,
    scope,
  };
};
