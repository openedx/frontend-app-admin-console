import { useId } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button, Collapsible, Icon } from '@openedx/paragon';
import { ChevronRight, ExpandMore } from '@openedx/paragon/icons';
import { CatalogIcon } from '@src/authz-module/catalog';
import type { Permission } from '@src/authz-module/catalog';
import messages from '../../messages';
import PermissionRow from './PermissionRow';

interface PermissionCategorySectionProps {
  title: string;
  icon: string | null;
  visiblePermissions: Permission[];
  selectedCount: number;
  totalCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  isPermissionOn: (permissionId: string) => boolean;
  getRequiredByNames: (permissionId: string) => string[] | undefined;
  onTogglePermission: (permissionId: string) => void;
  onSetAll: (isOn: boolean) => void;
}

/**
 * A category of the permissions matrix: a header that opens and closes it, with the "x of y"
 * count and Select all, and the rows.
 */
const PermissionCategorySection = ({
  title, icon, visiblePermissions, selectedCount, totalCount, isOpen, onToggleOpen,
  isPermissionOn, getRequiredByNames, onTogglePermission, onSetAll,
}: PermissionCategorySectionProps) => {
  const { formatMessage } = useIntl();
  const bodyId = useId();
  const isAllOn = selectedCount === totalCount;

  return (
    <Collapsible.Advanced
      role="group"
      className="permission-category bg-white border border-primary-300 rounded overflow-hidden mb-3"
      aria-label={title}
      open={isOpen}
      onToggle={onToggleOpen}
    >
      <div className="d-flex align-items-center bg-primary-100 px-3 py-2">
        <Collapsible.Trigger
          className="permission-category__toggle d-flex align-items-center flex-grow-1 text-primary-400"
          aria-controls={bodyId}
          // The trigger only handles Enter; a button also toggles on Space.
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === ' ') {
              e.preventDefault();
              onToggleOpen();
            }
          }}
        >
          <Icon src={isOpen ? ExpandMore : ChevronRight} className="mr-2" />
          <CatalogIcon name={icon} className="mr-2" />
          <span className="h4 mb-0 text-primary-400">{title}</span>
        </Collapsible.Trigger>
        <span className="small text-gray-500 mr-3">
          {formatMessage(messages['authz.roles.create.wizard.permissions.category.count'], {
            selected: selectedCount, total: totalCount,
          })}
        </span>
        <Button
          size="sm"
          variant="tertiary"
          className="rounded-pill border border-primary-200 bg-primary-100 text-info-600 font-weight-bold"
          onClick={() => onSetAll(!isAllOn)}
          aria-label={formatMessage(
            messages[`authz.roles.create.wizard.permissions.category.${isAllOn ? 'deselectAll' : 'selectAll'}.label`],
            { category: title },
          )}
        >
          {formatMessage(messages[`authz.roles.create.wizard.permissions.category.${isAllOn ? 'deselectAll' : 'selectAll'}`])}
        </Button>
      </div>
      <Collapsible.Body id={bodyId}>
        {visiblePermissions.map((permission) => (
          <PermissionRow
            key={permission.id}
            permission={permission}
            isOn={isPermissionOn(permission.id)}
            requiredByNames={getRequiredByNames(permission.id)}
            onToggle={() => onTogglePermission(permission.id)}
          />
        ))}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

export default PermissionCategorySection;
