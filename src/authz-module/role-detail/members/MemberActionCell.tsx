import { useIntl } from '@openedx/frontend-base';
import { useNavigate } from 'react-router-dom';
import {
  Delete, Visibility,
} from '@openedx/paragon/icons';
import { Icon, IconButton } from '@openedx/paragon';
import type { DataTableCellProps } from '@openedx/paragon';
import { buildAuditUserPath } from '@src/authz-module/constants';
import messages from '../messages';
import { FlattenedMember } from './MembersTable';

type MemberActionCellProps = DataTableCellProps<FlattenedMember> & {
  onClickDeleteButton: (member: FlattenedMember) => void;
};

const MemberActionCell = ({
  row, onClickDeleteButton,
}: MemberActionCellProps) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const member = row.original;

  const handleDelete = () => onClickDeleteButton(member);

  const handleViewUser = () => {
    navigate(buildAuditUserPath(member.username));
  };

  return (
    <div className="d-flex gap-2 justify-content-center">
      <IconButton
        src={Visibility}
        className="role-detail-action-button"
        iconAs={Icon}
        variant="primary"
        size="sm"
        onClick={handleViewUser}
        alt={formatMessage(messages['authz.role.members.table.action.view.alt'], { username: member.username })}
      />
      <IconButton
        src={Delete}
        iconAs={Icon}
        variant="danger"
        onClick={handleDelete}
        size="sm"
        alt={formatMessage(messages['authz.role.members.table.action.delete.alt'], { username: member.username })}
      />
    </div>
  );
};

export default MemberActionCell;
