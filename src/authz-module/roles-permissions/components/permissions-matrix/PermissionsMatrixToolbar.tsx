import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import SearchFilter from '@src/authz-module/components/TableControlBar/SearchFilter';
import messages from '../../messages';

interface PermissionsMatrixToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  areAllExpanded: boolean;
  onToggleExpandAll: () => void;
  /** Expand all / Collapse all does nothing while a search keeps the categories open. */
  isExpandAllDisabled: boolean;
}

/** Search and Expand all / Collapse all of the permissions matrix. */
const PermissionsMatrixToolbar = ({
  search, onSearchChange, areAllExpanded, onToggleExpandAll, isExpandAllDisabled,
}: PermissionsMatrixToolbarProps) => {
  const { formatMessage } = useIntl();
  const prefix = 'authz.roles.create.wizard.permissions';

  return (
    <div className="d-flex align-items-center flex-wrap mb-4">
      <SearchFilter
        filterValue={search}
        setFilter={(value) => onSearchChange(value ?? '')}
        placeholder={formatMessage(messages[`${prefix}.search.placeholder`])}
      />
      <Button
        className="ml-auto"
        size="sm"
        variant="link"
        iconAfter={areAllExpanded ? ExpandLess : ExpandMore}
        onClick={onToggleExpandAll}
        disabled={isExpandAllDisabled}
      >
        {formatMessage(messages[`${prefix}.${areAllExpanded ? 'collapseAll' : 'expandAll'}`])}
      </Button>
    </div>
  );
};

export default PermissionsMatrixToolbar;
