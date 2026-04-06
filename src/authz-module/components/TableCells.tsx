import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import {
  RemoveRedEye, Language, School, LibraryBooks,
} from '@openedx/paragon/icons';
import { TableCellValue, TeamMember, AppContextType } from '@src/types';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import messages from './messages';

type CellProps = TableCellValue<TeamMember>;
type ExtendedCellProps = CellProps & {
  value: string;
  cell: {
    getCellProps: (props?: Record<string, string>) => Record<string, string>;
  };
};

const SCOPE_ICONS = {
  COURSE: School,
  LIBRARY: LibraryBooks,
  GLOBAL: Language,
};

const NameCell = ({ row }: CellProps) => {
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;
  const username = authenticatedUser?.username;

  if (row.original.username === username) {
    return (
      <span>
        {row.original.fullName}
        <span className="text-gray-500">{intl.formatMessage(messages['authz.table.username.current'])}</span>
      </span>
    );
  }
  return row.original.fullName;
};

const ActionCell = ({ row }: CellProps) => {
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

const ScopeCell = ({ row }: CellProps) => {
  const { scope } = row.original;
  const iconSrc = SCOPE_ICONS[scope.type];
  return (
    <span className="d-flex align-items-center">
      {iconSrc && <Icon color="primary" src={iconSrc} className="mr-2" size="xs" />}
      {scope.resource}
    </span>
  );
};

const RoleCell = ({ value, cell }: ExtendedCellProps) => (
  <td {...cell.getCellProps({ 'data-role': value })}>
    {value}
  </td>
);

export {
  NameCell, ActionCell, ScopeCell, RoleCell,
};
