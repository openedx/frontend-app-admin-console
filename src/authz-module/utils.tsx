import { Icon } from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from './constants';

export const getCellHeader = (columnId: string, columnTitle: string, filtersApplied: string[]) => {
  if (filtersApplied.includes(columnId)) {
    return (
      <span className="d-flex flex-row align-items-center">
        <Icon src={FilterList} size="sm" className="mr-2" />
        {columnTitle}
      </span>
    );
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
