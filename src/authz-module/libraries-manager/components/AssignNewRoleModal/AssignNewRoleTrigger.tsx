import { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { useToastManager } from '@src/authz-module/libraries-manager/ToastManagerContext';
import AssignNewRoleModal from './AssignNewRoleModal';

import messages from '../messages';

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
  const { showToast, showErrorToast } = useToastManager();
  const [newRole, setNewRole] = useState<string>('');

  const { mutate: assignTeamMembersRole, isPending: isAssignTeamMembersRolePending } = useAssignTeamMembersRole();

  const handleAddRole = () => {
    const data = {
      users: [username],
      role: newRole,
      scope: libraryId,
    };

    if (currentUserRoles.includes(newRole)) {
      showToast({
        message: intl.formatMessage(messages['libraries.authz.manage.assign.role.existing']),
        type: 'success',
      });
      close();
      setNewRole('');
      return;
    }

    const runAssignRole = (variables = { data }) => {
      assignTeamMembersRole(variables, {
        onSuccess: () => {
          showToast({
            message: intl.formatMessage(messages['libraries.authz.manage.assign.role.success']),
            type: 'success',
          });
          close();
          setNewRole('');
        },
        onError: (error, retryVariables) => {
          showErrorToast(error, () => runAssignRole(retryVariables));
        },
      });
    };

    runAssignRole();
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
    </>
  );
};

export default AssignNewRoleTrigger;
