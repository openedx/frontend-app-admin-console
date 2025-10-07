import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useAssignTeamMembersRole } from 'authz-module/data/hooks';
import messages from './messages';
import AssignNewRoleModal from './AssignNewRoleModal';

interface AssignNewRoleTriggerProps {
  username: string;
  libraryId: string;
  currentUserRoles: string[];
}

const AssignNewRoleTrigger: FC<AssignNewRoleTriggerProps> = ({
  username,
  libraryId,
  currentUserRoles,
}) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const { roles } = useLibraryAuthZ();

  const [newRole, setNewRole] = useState<string>('');

  const { mutate: assignTeamMembersRole, isPending: isAssignTeamMembersRolePending } = useAssignTeamMembersRole();

  const handleAddTeamMember = () => {
    const data = {
      users: [username],
      role: newRole,
      scope: libraryId,
    };

    assignTeamMembersRole({ data }, {
      onSuccess: () => {
        close();
        setNewRole('');
      },
    });
  };

  return (
    <>
      <Button
        key="authz-header-action-new-team-member"
        iconBefore={Plus}
        onClick={open}
      >
        {intl.formatMessage(messages['libraries.authz.manage.assign.new.role.title'])}
      </Button>

      {isOpen && (
        <AssignNewRoleModal
          isOpen={isOpen}
          close={close}
          onSave={handleAddTeamMember}
          isLoading={isAssignTeamMembersRolePending}
          roleOptions={roles.filter(role => !currentUserRoles.includes(role.role))}
          selectedRole={newRole}
          handleChangeSelectedRole={(e) => setNewRole(e.target.value)}
        />
      )}
    </>
  );
};

export default AssignNewRoleTrigger;
