import { useContext, type ReactNode } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import type { TeamMember } from '@src/types';
import messages from '../messages';

/** Marks the row belonging to the signed-in user. */
const Marker = (chunks: ReactNode[]) => <span className="text-gray-500">{chunks}</span>;

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
  const { authenticatedUser } = useContext(AppContext);
  const { username = '' } = row.original;
  const isCurrentUser = username === authenticatedUser?.username;

  return (
    <span className="d-block text-truncate authz-cell-username" title={username}>
      {isCurrentUser
        ? (
          <FormattedMessage
            {...messages['authz.team.members.table.username.current']}
            values={{ username, Marker }}
          />
        )
        : username}
    </span>
  );
};

export const EmailCell = ({ value }: EmailCellProps) => (
  <span className="d-block text-truncate authz-cell-email" title={value}>{value}</span>
);
