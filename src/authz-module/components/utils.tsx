import { Icon } from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';

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
