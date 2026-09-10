import { useContext } from 'react';
import { DataTableContext, type DataTableRow } from '@openedx/paragon';

interface DataTableInstance {
  state?: {
    expanded?: Record<string, boolean>;
  };
  toggleRowExpanded?: (rowId: string, expanded: boolean) => void;
}

/**
 * Returns a handler that toggles `row`, collapsing any other expanded row first so only one
 * is open at a time. Paragon's `isExpandable` allows several, and a table whose rows expand
 * into a nested table only reads clearly with one breakdown showing.
 */
export const useExclusiveRowExpansion = (row: DataTableRow<unknown>) => {
  const instance = useContext(DataTableContext) as DataTableInstance;

  return () => {
    if (!row.isExpanded && instance) {
      const expanded = instance.state?.expanded || {};
      Object.keys(expanded).forEach((rowId) => {
        if (rowId !== row.id && expanded[rowId]) {
          instance.toggleRowExpanded?.(rowId, false);
        }
      });
    }
    row.toggleRowExpanded?.();
  };
};
