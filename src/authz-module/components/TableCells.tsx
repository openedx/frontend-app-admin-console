import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import {
  RemoveRedEye,
  Delete, ExpandMore,
  Info,
} from '@openedx/paragon/icons';
import {
  TableCellValue, AppContextType, UserRole, RoleToDelete,
} from '@src/types';
import { useNavigate } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { ADMIN_ROLES, DJANGO_MANAGED_ROLES, MAP_ROLE_KEY_TO_LABEL } from '@src/authz-module/constants';
import {
  Icon, IconButton, OverlayTrigger, Tooltip, DataTableContext,
} from '@openedx/paragon';
import { RESOURCE_ICONS } from './constants';
import messages from './messages';
import ViewMoreLink from './ViewMoreLink';

interface DataTableInstance {
  state?: {
    expanded?: Record<string, boolean>;
  };
  toggleRowExpanded?: (rowId: string, expanded: boolean) => void;
}

type CellProps = TableCellValue<UserRole>;
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
};

type ActionsCellProps = CellProps & ActionsCellExtraProps;

const NameCell = ({ row }: CellProps) => {
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;
  const username = authenticatedUser?.username;

  if (row.original.username === username) {
    return (
      <span>
        {row.original.fullName || row.original.username}
        <span className="text-gray-500">{intl.formatMessage(messages['authz.table.username.current'])}</span>
      </span>
    );
  }
  return row.original.fullName || row.original.username;
};

const ViewActionCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const viewPath = `/authz/user/${row.original.username}`;
  return (
    <IconButton
      src={RemoveRedEye}
      alt={formatMessage(messages['authz.table.column.actions.view.title'])}
      size="sm"
      onClick={() => navigate(viewPath)}
    />
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

  const { scopeText, iconSrc } = useMemo(() => {
    if (DJANGO_MANAGED_ROLES.includes(row.original.role)) {
      return {
        scopeText: formatMessage(messages['authz.user.table.scope.global.label']),
        iconSrc: RESOURCE_ICONS.GLOBAL,
      };
    }
    const scopeIcon = row.original.role?.startsWith('lib') ? RESOURCE_ICONS.LIBRARY : RESOURCE_ICONS.COURSE;
    return {
      scopeText: row.original.scope,
      iconSrc: scopeIcon,
    };
  }, [row.original.role, row.original.scope, formatMessage]);

  return (
    <span className="d-flex align-items-center">
      {iconSrc && <Icon color="primary" src={iconSrc} className="mr-2" size="xs" />}
      {scopeText}
    </span>
  );
};

const RoleCell = ({ value, cell }: ExtendedCellProps) => (
  <span {...cell.getCellProps({ 'data-role': MAP_ROLE_KEY_TO_LABEL[value] || '' })}>
    {MAP_ROLE_KEY_TO_LABEL[value] || ''}
  </span>
);

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
    row.toggleRowExpanded();
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

const ActionsCell = ({ row, onClickDeleteButton, isUserAuthenticatedPage }: ActionsCellProps) => {
  const { formatMessage } = useIntl();
  const { role } = row.original;

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
      <IconButton
        // @ts-ignore
        disabled
        isActive={false}
        variant="light"
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        src={Delete}
      />
    );
  }

  return (
    <IconButton variant="danger" onClick={handleDelete} alt={formatMessage(messages['authz.user.table.delete.action.alt'])} src={Delete} />
  );
};

const createActionsCell = (extraProps: ActionsCellExtraProps) => function customActionsCell(cellProps) {
  return <ActionsCell {...cellProps} {...extraProps} />;
};

export {
  NameCell,
  ViewActionCell,
  RoleCell,
  OrgCell,
  ScopeCell,
  PermissionsCell,
  ViewAllPermissionsCell,
  createActionsCell,
};
