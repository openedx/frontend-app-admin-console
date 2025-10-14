import {
  useContext, useState, useMemo, useCallback,
  useEffect,
  FC,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
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
};

const SortDropdown: FC = () => {
  const intl = useIntl();
  const { toggleSortBy, state } = useContext<DataTableContext>(DataTableContext);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  const SORT_LABELS: Record<string, string> = useMemo(() => ({
    'name-a-z': intl.formatMessage({ id: 'authz.libraries.team.table.sort.name-a-z', defaultMessage: 'Name A-Z' }),
    'name-z-a': intl.formatMessage({ id: 'authz.libraries.team.table.sort.name-z-a', defaultMessage: 'Name Z-A' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const currentSort = useMemo(() => {
    if (!state?.sortBy?.length) { return undefined; }

    const activeSortBy = state.sortBy[0];
    return Object.entries(SORT_BY_OPTIONS).find(
      ([, option]) => option.id === activeSortBy.id && option.desc === activeSortBy.desc,
    )?.[0]; // return the key
  }, [state?.sortBy]);

  useEffect(() => {
    setSortOrder(currentSort);
  }, [currentSort]);

  const handleChangeSortBy = useCallback((newSortOrder: string) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currentSortLabel = sortOrder ? SORT_LABELS[sortOrder] : 'Sort';

  return (
    <Dropdown onSelect={handleChangeSortBy}>
      <Dropdown.Toggle variant="outline-primary">
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
          >
            {label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SortDropdown;
