import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Delete, ExpandMore,
  Info,
} from '@openedx/paragon/icons';
import { UserRoleWithPermissions, RoleToDelete } from '@src/types';
import { useContext, useMemo, type ComponentProps } from 'react';
import {
  ADMIN_ROLES, DJANGO_MANAGED_ROLES, MAP_ROLE_KEY_TO_LABEL,
} from '@src/authz-module/constants';
import {
  Icon, IconButton, OverlayTrigger, Tooltip, DataTableContext,
  type DataTableCellProps,
} from '@openedx/paragon';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import messages from './messages';
import ViewMoreLink from './ViewMoreLink';

interface DataTableInstance {
  state?: {
    expanded?: Record<string, boolean>;
  };
  toggleRowExpanded?: (rowId: string, expanded: boolean) => void;
}

type CellProps = DataTableCellProps<UserRoleWithPermissions>;
type CellPropsWithValue = CellProps & {
  value: string;
};
type ExtendedCellProps = CellPropsWithValue & {
  cell: {
    getCellProps: (props?: Record<string, string>) => Record<string, string>;
  };
};

type ActionsCellExtraProps = {
  onClickDeleteButton: (role: RoleToDelete) => void;
  isUserAuthenticatedPage: boolean;
  isCourseEnabled?: (scope: string) => boolean;
};

type ActionsCellProps = CellProps & ActionsCellExtraProps;

type DisabledCourseActionButtonProps = Pick<ComponentProps<typeof IconButton>, 'src' | 'alt' | 'size' | 'variant'>;

// A disabled button can't trigger its own tooltip (Paragon sets pointer-events: none on it),
// so the OverlayTrigger must live on a wrapper element that still receives hover events.
export const DisabledCourseActionButton = ({
  src, alt, size, variant,
}: DisabledCourseActionButtonProps) => {
  const { formatMessage } = useIntl();
  return (
    <OverlayTrigger
      placement="left"
      overlay={(
        <Tooltip variant="light" id="tooltip-left">
          {formatMessage(messages['authz.table.actions.course.disabled.tooltip'])}
        </Tooltip>
      )}
    >
      <span className="d-inline-block">
        <IconButton
          src={src}
          alt={alt}
          size={size}
          variant={variant}
          disabled
        />
      </span>
    </OverlayTrigger>
  );
};

const OrgCell = ({ value, row }: CellPropsWithValue) => {
  const { formatMessage } = useIntl();
  return (
    <span>
      {DJANGO_MANAGED_ROLES.includes(row.original.role) ? formatMessage(messages['authz.user.table.org.all.organizations.label']) : value}
    </span>
  );
};

const ScopeCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();

  const { scopeText, iconSrc } = useMemo(() => ({
    scopeText: DJANGO_MANAGED_ROLES.includes(row.original.role)
      ? formatMessage(messages['authz.user.table.scope.global.label'])
      : row.original.scope,
    iconSrc: getScopeResourceIcon(row.original.role),
  }), [row.original.role, row.original.scope, formatMessage]);

  return (
    <span className="d-flex align-items-center">
      {iconSrc && <Icon color="primary" src={iconSrc} className="mr-2" size="xs" />}
      {scopeText}
    </span>
  );
};

const RoleCell = ({ value, cell }: ExtendedCellProps) => {
  const { key, ...cellProps } = cell.getCellProps({ 'data-role': MAP_ROLE_KEY_TO_LABEL[value] || '' });
  return (
    <span key={key} {...cellProps}>
      {MAP_ROLE_KEY_TO_LABEL[value] || ''}
    </span>
  );
};

const PermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const { role, permissionCount: count } = row.original;
  const isDjangoRole = DJANGO_MANAGED_ROLES.includes(role);
  return (
    <span>
      { isDjangoRole
        ? formatMessage(
          messages['authz.user.table.permissions.access.label'],
          { accessType: role === 'django.superuser' ? 'total' : 'partial' },
        )
        : formatMessage(messages['authz.user.table.permissions.available.count'], { count })}
    </span>
  );
};

const ViewAllPermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const instance = useContext(DataTableContext) as DataTableInstance;
  const handleToggleExpanded = () => {
    if (!row.isExpanded && instance) {
      // Close all other expanded rows first
      const expanded = instance.state?.expanded || {};
      Object.keys(expanded).forEach(rowId => {
        if (rowId !== row.id && expanded[rowId]) {
          instance.toggleRowExpanded?.(rowId, false);
        }
      });
    }
    // Toggle the current row
    row.toggleRowExpanded?.();
  };

  return (
    <div role="button">
      <ViewMoreLink
        label={formatMessage(
          row.isExpanded
            ? messages['authz.user.table.view_all_permissions.link.text.close']
            : messages['authz.user.table.view_all_permissions.link.text.open'],
        )}
        onClick={handleToggleExpanded}
        iconSrc={ExpandMore}
      />
    </div>
  );
};

const ActionsCell = ({
  row, onClickDeleteButton, isUserAuthenticatedPage, isCourseEnabled,
}: ActionsCellProps) => {
  const { formatMessage } = useIntl();
  const { role, canManageScope } = row.original;

  const handleDelete = () => {
    const roleToDelete = {
      role,
      scope: row.original.scope,
      name: MAP_ROLE_KEY_TO_LABEL[role] || '',
    } as RoleToDelete;
    onClickDeleteButton(roleToDelete);
  };

  if (DJANGO_MANAGED_ROLES.includes(role)) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip variant="light" id="tooltip-left">
            {formatMessage(messages['authz.user.table.delete.action.djangorole.tooltip'])}
          </Tooltip>
      )}
      >
        <Icon
          className="mx-2 pl-1"
          src={Info}
        />
      </OverlayTrigger>
    );
  }

  if (ADMIN_ROLES.includes(role) && isUserAuthenticatedPage) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip variant="light" id="tooltip-left">
            {formatMessage(messages['authz.user.table.delete.action.adminrole.tooltip'])}
          </Tooltip>
      )}
      >
        <Icon
          className="mx-2 pl-1 text-light-500"
          src={Delete}
        />
      </OverlayTrigger>
    );
  }

  const isCourseScope = !role?.startsWith('lib');
  const isCourseAuthoringDisabled = isCourseEnabled !== undefined
    && isCourseScope && !isCourseEnabled(row.original.scope);

  if (isCourseAuthoringDisabled) {
    return (
      <DisabledCourseActionButton
        src={Delete}
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        variant="light"
      />
    );
  }

  return (
    <IconButton
      disabled={!canManageScope}
      variant={canManageScope ? 'danger' : 'light'}
      onClick={handleDelete}
      alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
      src={Delete}
    />
  );
};

const createActionsCell = (extraProps: ActionsCellExtraProps) => function customActionsCell(cellProps) {
  return <ActionsCell {...cellProps} {...extraProps} />;
};

export {
  RoleCell,
  OrgCell,
  ScopeCell,
  PermissionsCell,
  ViewAllPermissionsCell,
  createActionsCell,
};
