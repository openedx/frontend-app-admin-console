import {
  useContext, useState, useMemo, useCallback,
  useEffect,
  FC,
} from 'react';
import {
  DataTableContext,
  Dropdown,
  Icon,
  Stack,
} from '@openedx/paragon';
import { SwapVert } from '@openedx/paragon/icons';

interface SortOption {
  id: string;
  desc: boolean;
  label: string;
}

interface SortByOptions {
  [key: string]: Omit<SortOption, 'label'>;
}

const SORT_BY_OPTIONS: SortByOptions = {
  'name-a-z': { id: 'username', desc: false },
  'name-z-a': { id: 'username', desc: true },
  newest: { id: 'createdAt', desc: true },
  oldest: { id: 'createdAt', desc: false },
};

const SORT_LABELS: Record<string, string> = {
  'name-a-z': 'Name A-Z',
  'name-z-a': 'Name Z-A',
  newest: 'Newest',
  oldest: 'Oldest',
};

const SortDropdown: FC = () => {
  const { toggleSortBy, state } = useContext<DataTableContext>(DataTableContext);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  // Get current sort state from DataTable context
  const currentSort = useMemo(() => {
    if (!state?.sortBy?.length) { return undefined; }

    const activeSortBy = state.sortBy[0];
    return Object.entries(SORT_BY_OPTIONS).find(
      ([, option]) => option.id === activeSortBy.id && option.desc === activeSortBy.desc,
    )?.[0];
  }, [state?.sortBy]);

  // Update local state when external sort changes
  useEffect(() => {
    setSortOrder(currentSort);
  }, [currentSort]);

  const handleChangeSortBy = useCallback((newSortOrder: string) => {
    if (!SORT_BY_OPTIONS[newSortOrder]) {
      console.warn(`Invalid sort option: ${newSortOrder}`);
      return;
    }

    setSortOrder(newSortOrder);
    const { id, desc } = SORT_BY_OPTIONS[newSortOrder];
    toggleSortBy(id, desc);
  }, [toggleSortBy]);

  const sortOptions = useMemo(
    () => Object.entries(SORT_BY_OPTIONS).map(([key, option]) => ({
      key,
      ...option,
      label: SORT_LABELS[key],
    })),
    [],
  );

  const currentSortLabel = sortOrder ? SORT_LABELS[sortOrder] : 'Sort';

  return (
    <Dropdown onSelect={handleChangeSortBy}>
      <Dropdown.Toggle
        variant="outline-primary"
        aria-label={`Sort options. Currently sorted by: ${currentSortLabel}`}
      >
        <Stack direction="horizontal" gap={2}>
          <Icon color="primary" src={SwapVert} />
          {currentSortLabel}
        </Stack>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {sortOptions.map(({ key, label }) => (
          <Dropdown.Item
            key={key}
            active={sortOrder === key}
            eventKey={key}
            aria-label={`Sort by ${label}`}
          >
            {label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SortDropdown;
