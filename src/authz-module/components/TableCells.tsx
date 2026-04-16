import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import {
  RemoveRedEye,
} from '@openedx/paragon/icons';
import { TableCellValue, AppContextType, UserRole } from '@src/types';
import { useNavigate } from 'react-router-dom';
import { useContext, useMemo } from 'react';
import { DJANGO_MANAGED_ROLES, MAP_ROLE_KEY_TO_LABEL } from '@src/authz-module/constants';
import messages from './messages';
import { RESOURCE_ICONS } from './constants';

type CellProps = TableCellValue<UserRole>;
type CellPropsWithValue = CellProps & {
  value: string;
};
type ExtendedCellProps = CellPropsWithValue & {
  cell: {
    getCellProps: (props?: Record<string, string>) => Record<string, string>;
  };
};

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
    <td>
      {DJANGO_MANAGED_ROLES.includes(row.original.role) ? formatMessage(messages['authz.user.table.org.all.organizations.label']) : value}
    </td>
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
  <td {...cell.getCellProps({ 'data-role': MAP_ROLE_KEY_TO_LABEL[value] || '' })}>
    {MAP_ROLE_KEY_TO_LABEL[value] || ''}
  </td>
);

export {
  NameCell, ViewActionCell, ScopeCell, RoleCell, OrgCell,
};
