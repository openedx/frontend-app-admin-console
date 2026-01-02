import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { PutAssignTeamMembersRoleResponse } from 'authz-module/data/api';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { RoleOperationErrorStatus } from '@src/authz-module/constants';
import { AppToast, useToastManager } from '@src/authz-module/libraries-manager/ToastManagerContext';
import { DEFAULT_TOAST_DELAY } from '@src/authz-module/libraries-manager/constants';
import AddNewTeamMemberModal from './AddNewTeamMemberModal';
import messages from './messages';

type AppToastOmitIdType = Omit<AppToast, 'id'>;
interface AddNewTeamMemberTriggerProps {
  libraryId: string;
}

const DEFAULT_FORM_VALUES = {
  users: '',
  role: '',
};

const AddNewTeamMemberTrigger: FC<AddNewTeamMemberTriggerProps> = ({ libraryId }) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [isError, setIsError] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string[]>([]);

  const { mutate: assignTeamMembersRole, isPending } = useAssignTeamMembersRole();
  const {
    showToast, showErrorToast, Bold, Br,
  } = useToastManager();

  const resetForm = () => {
    setFormValues(DEFAULT_FORM_VALUES);
    setErrorUsers([]);
    setIsError(false);
  };

  const handleClose = () => {
    resetForm();
    close();
  };

  const handleChangeForm = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const userIds = value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    // Flag error if current value still includes invalid users
    const hasInvalidUser = errorUsers.some((u) => userIds.includes(u));
    setIsError(hasInvalidUser);

    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const buildErrorMessages = (
    errors: PutAssignTeamMembersRoleResponse['errors'],
  ): Array<AppToastOmitIdType> => {
    const notFoundUsers = errors
      .filter((err) => err.error === RoleOperationErrorStatus.USER_NOT_FOUND)
      .map((err) => err.userIdentifier.trim());

    const otherErrors = errors.filter(
      (err) => err.error !== RoleOperationErrorStatus.USER_NOT_FOUND
       && err.error !== RoleOperationErrorStatus.USER_ALREADY_HAS_ROLE,
    );

    const result: Array<AppToastOmitIdType> = [];

    const errorTypes = [
      {
        errorMessageId: 'libraries.authz.manage.add.member.failure.not.found',
        users: notFoundUsers,
      },
      {
        errorMessageId: 'libraries.authz.manage.add.member.failure.generic',
        users: otherErrors,
      },
    ];

    errorTypes.forEach(({ errorMessageId, users }) => {
      if (users.length === 0) { return; }
      const errorMessage = intl.formatMessage(messages[errorMessageId], {
        count: users.length,
        userIds: users.join(', '),
        Bold,
        Br,
      });
      result.push({ message: errorMessage, type: 'error' });
    });

    return result;
  };

  const buildSuccessMessage = (completed: PutAssignTeamMembersRoleResponse['completed']): AppToastOmitIdType => {
    const userIds = completed.map((user) => user.userIdentifier).join(', ');
    const successMessage = intl.formatMessage(messages['libraries.authz.manage.add.member.success'], {
      count: completed.length,
      userIds,
    });

    return {
      message: successMessage,
      type: 'success',
    };
  };

  const buildRoleAlreadyAssignedMessage = (
    roleAlreadyAsignedUsers: PutAssignTeamMembersRoleResponse['errors'],
  ): AppToastOmitIdType => {
    const roleAlreadyAssignedUserIds = roleAlreadyAsignedUsers.map((err) => err.userIdentifier.trim());
    const roleAlreadyAssignedMessage = intl.formatMessage(messages['libraries.authz.manage.assign.role.existing'], {
      count: roleAlreadyAssignedUserIds.length,
      userIds: roleAlreadyAssignedUserIds.join(', '),
      Bold,
      Br,
    });
    return {
      message: roleAlreadyAssignedMessage,
      type: 'success',
    };
  };

  const handleAddTeamMember = () => {
    const normalizedUsers = [...new Set(
      formValues.users
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean),
    )];

    const payload = {
      users: normalizedUsers,
      role: formValues.role,
      scope: libraryId,
    };

    const runAssignMembers = (variables = { data: payload }) => {
      assignTeamMembersRole(variables, {
        onSuccess: (response) => {
          const { completed, errors } = response;
          const feedbackMessages: Array<AppToastOmitIdType> = [];
          const { USER_ALREADY_HAS_ROLE } = RoleOperationErrorStatus;
          // Users who already have the role assigned are not considered errors
          const roleAlreadyAssignedUsers = errors.filter((error) => error.error === USER_ALREADY_HAS_ROLE);
          const cleanErrors = errors.filter((error) => error.error !== USER_ALREADY_HAS_ROLE);

          if (completed.length) {
            feedbackMessages.push(buildSuccessMessage(completed));
          }
          if (roleAlreadyAssignedUsers.length) {
            feedbackMessages.push(buildRoleAlreadyAssignedMessage(roleAlreadyAssignedUsers));
          }
          if (cleanErrors.length) {
            const errorMessages = buildErrorMessages(cleanErrors);
            feedbackMessages.push(...errorMessages);

            const successUserIds = [
              ...completed.map(c => c.userIdentifier),
              ...roleAlreadyAssignedUsers.map(r => r.userIdentifier),
            ];

            const errorUserIds = normalizedUsers.filter((user) => !successUserIds.includes(user));
            setErrorUsers(errorUserIds);
            setIsError(true);
            setFormValues((prev) => ({
              ...prev,
              users: errorUserIds.join(', '),
            }));
          }

          // Calculate delay based on the number of feedback messages, 5 seconds per message
          const delay = DEFAULT_TOAST_DELAY * feedbackMessages.length;
          feedbackMessages.forEach(({ message, type }) => {
            showToast({ message, type, delay });
          });

          if (!cleanErrors.length) {
            handleClose();
          }
        },
        onError: (error, retryVariables) => {
          showErrorToast(error, () => runAssignMembers(retryVariables));
        },
      });
    };
    runAssignMembers();
  };

  return (
    <>
      <Button
        iconBefore={Plus}
        onClick={open}
        disabled={isPending}
      >
        {intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
      </Button>

      {isOpen && (
        <AddNewTeamMemberModal
          isOpen={isOpen}
          isError={isError}
          close={handleClose}
          onSave={handleAddTeamMember}
          isLoading={isPending}
          formValues={formValues}
          handleChangeForm={handleChangeForm}
        />
      )}
    </>
  );
};

export default AddNewTeamMemberTrigger;
