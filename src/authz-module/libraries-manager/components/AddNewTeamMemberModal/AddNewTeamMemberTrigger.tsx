import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { PutAssignTeamMembersRoleResponse } from 'authz-module/data/api';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { RoleOperationErrorStatus } from '@src/authz-module/constants';
import { useToastManager } from '@src/authz-module/libraries-manager/ToastManagerContext';
import AddNewTeamMemberModal from './AddNewTeamMemberModal';
import messages from './messages';

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

  const handleErrors = (
    errors: PutAssignTeamMembersRoleResponse['errors'],
    successfulCount: number,
  ) => {
    const notFoundUsers = errors
      .filter((err) => err.error === RoleOperationErrorStatus.USER_NOT_FOUND)
      .map((err) => err.userIdentifier.trim());

    const alreadyHasRole = errors.some(
      (err) => err.error === RoleOperationErrorStatus.USER_ALREADY_HAS_ROLE,
    );

    if (alreadyHasRole && errors.length === 1 && !successfulCount) {
      showToast({
        message: intl.formatMessage(messages['libraries.authz.manage.assign.role.existing']),
        type: 'error',
      });
      handleClose();
      return;
    }

    if (notFoundUsers.length) {
      setErrorUsers(notFoundUsers);
      setIsError(true);
      setFormValues((prev) => ({
        ...prev,
        users: notFoundUsers.join(', '),
      }));

      const toastMessage = successfulCount
        ? intl.formatMessage(messages['libraries.authz.manage.add.member.partial'], {
          countSuccess: successfulCount,
          countFailure: notFoundUsers.length,
          Bold,
          Br,
        })
        : intl.formatMessage(messages['libraries.authz.manage.add.member.failure'], {
          count: notFoundUsers.length,
          Bold,
          Br,
        });

      showToast({
        message: toastMessage,
        type: 'error',
      });
    }
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

          if (completed.length && !errors.length) {
            showToast({
              message: intl.formatMessage(messages['libraries.authz.manage.add.member.success'], {
                count: completed.length,
              }),
              type: 'success',
            });
            handleClose();
            return;
          }

          if (errors.length) {
            handleErrors(errors, completed.length);
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
