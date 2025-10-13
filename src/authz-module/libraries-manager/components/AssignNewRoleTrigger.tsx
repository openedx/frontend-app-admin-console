import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Toast, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { roles } = useLibraryAuthZ();

  const [newRole, setNewRole] = useState<string>('');

  const { mutate: assignTeamMembersRole, isPending: isAssignTeamMembersRolePending } = useAssignTeamMembersRole();

  const handleAddRole = () => {
    const data = {
      users: [username],
      role: newRole,
      scope: libraryId,
    };

    if (currentUserRoles.includes(newRole)) {
      close();
      setNewRole('');
      return;
    }

    assignTeamMembersRole({ data }, {
      onSuccess: () => {
        setToastMessage(
          intl.formatMessage(
            messages['libraries.authz.manage.assign.role.success'],
          ),
        );
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
          onSave={handleAddRole}
          isLoading={isAssignTeamMembersRolePending}
          roleOptions={roles}
          selectedRole={newRole}
          handleChangeSelectedRole={(e) => setNewRole(e.target.value)}

        />
      )}

      {toastMessage && (
        <Toast
          onClose={() => setToastMessage(null)}
          show={!!toastMessage}
        >
          {toastMessage}
        </Toast>
      )}
    </>
  );
};

export default AssignNewRoleTrigger;
