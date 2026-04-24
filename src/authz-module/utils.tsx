import { Icon } from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from './constants';

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
