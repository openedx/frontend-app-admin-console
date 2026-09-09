import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface NameCellProps {
  row: { original: TeamMember };
}

interface EmailCellProps {
  value: string;
}

/**
 * Username column. Shows the username verbatim — the API also sends `fullName`, but this
 * column is headed "Username" and is what the table sorts and searches on. The row for the
 * signed-in user is marked so they can find themselves in the list.
 */
export const NameCell = ({ row }: NameCellProps) => {
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext);
  const { username = '' } = row.original;
  const isCurrentUser = username === authenticatedUser?.username;

  return (
    <span className="d-block text-truncate authz-cell-username" title={username}>
      {username}
      {isCurrentUser && (
        <span className="text-gray-500">{intl.formatMessage(messages['authz.table.username.current'])}</span>
      )}
    </span>
  );
};

export const EmailCell = ({ value }: EmailCellProps) => (
  <span className="d-block text-truncate authz-cell-email" title={value}>{value}</span>
);
