import { useContext, useEffect, useRef } from 'react';
import { DataTableContext } from '@openedx/paragon';

interface DataTableInstance {
  state: {
    pageIndex: number;
    filters: Array<{ id: string; value: unknown }>;
  };
  toggleAllRowsExpanded?: (expanded: boolean) => void;
}

/**
 * Collapses every expanded row whenever the page changes or a filter is applied or
 * removed, so a stale breakdown never stays open over rows it no longer belongs to.
 *
 * Renders nothing — it exists to read `DataTableContext`, so it must sit inside
 * `<DataTable>`.
 */
const CollapseRowsOnChange = () => {
  const { state, toggleAllRowsExpanded } = useContext(DataTableContext) as DataTableInstance;
  const { pageIndex, filters } = state;
  // Serialized so the effect compares filter contents rather than array identity, which
  // react-table replaces on every render.
  const serializedFilters = JSON.stringify(filters);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Nothing is expanded on mount; collapsing here would fight the initial state.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    toggleAllRowsExpanded?.(false);
  }, [pageIndex, serializedFilters, toggleAllRowsExpanded]);

  return null;
};

export default CollapseRowsOnChange;
