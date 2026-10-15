import { Icon } from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import { RESOURCE_ICONS } from './components/constants';
import { getScopeType, MANAGE_TEAM_ACTIONS, SCOPE_TYPES } from './constants';

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
 * Picks the course or library icon for a scope from the scope key itself.
 */
export const getScopeResourceIcon = (scope: string) => (
  getScopeType(scope) === SCOPE_TYPES.LIBRARY ? RESOURCE_ICONS.LIBRARY : RESOURCE_ICONS.COURSE
);

/** Unrecognised scopes fall back to the course permission, as `getScopeType` does. */
export const getScopeManageAction = (scope: string) => MANAGE_TEAM_ACTIONS[getScopeType(scope)];

export const getScopeManageActionPermission = (scope: string) => {
  const action = getScopeManageAction(scope);
  return {
    action,
    scope,
  };
};

// "md" is mapped to undefined because Paragon's Form.Control has no "md" size.
export const validateSizeFormControl = (size) =>
  size === 'md' ? undefined : size;
