import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Toast, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { PutAssignTeamMembersRoleResponse } from 'authz-module/data/api';
import { useAssignTeamMembersRole } from '@src/authz-module/data/hooks';
import { RoleOperationErrorStatus } from '@src/authz-module/constants';
import AddNewTeamMemberModal from './AddNewTeamMemberModal';
import messages from './messages';

interface AddNewTeamMemberTriggerProps {
  libraryId: string;
}

const DEFAULT_FORM_VALUES = {
  users: '',
  role: '',
};

const AddNewTeamMemberTrigger: FC<AddNewTeamMemberTriggerProps> = ({
  libraryId,
}) => {
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [additionMessage, setAdditionMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [isError, setIsError] = useState(false);

  const { mutate: assignTeamMembersRole, isPending: isAssignTeamMembersRolePending } = useAssignTeamMembersRole();

  const handleChangeForm = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isError) {
      setIsError(false);
    }
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleErrors = (errors: PutAssignTeamMembersRoleResponse['errors']) => {
    setIsError(false);
    const notFoundUsers = errors.filter(err => err.error === RoleOperationErrorStatus.USER_NOT_FOUND)
      .map(err => err.userIdentifier);

    if (errors.length == 1 && errors[0].error == RoleOperationErrorStatus.USER_ALREADY_HAS_ROLE) {
      setFormValues(DEFAULT_FORM_VALUES);
      close();
    };

    if (notFoundUsers.length) {
      setIsError(true);
      setFormValues((prev) => ({
        ...prev,
        users: prev.users
          .split(',')
          .map(user => user.trim())
          .filter(user => notFoundUsers.includes(user))
          .join(', '),
      }));
      setAdditionMessage((prevMessage) => (
        `${prevMessage ? `${prevMessage} ` : ''}${intl.formatMessage(
          messages['libraries.authz.manage.add.member.failure'],
          { count: notFoundUsers.length },
        )}`
      ));
    }
  };

  const handleAddTeamMember = () => {
    const data = {
      users: formValues.users.split(',').map(user => user.trim()),
      role: formValues.role,
      scope: libraryId,
    };

    assignTeamMembersRole({ data }, {
      onSuccess: (successData) => {
        setAdditionMessage(null);

        if (successData.completed.length) {
          setAdditionMessage(
            intl.formatMessage(
              messages['libraries.authz.manage.add.member.success'],
              { count: successData.completed.length },
            ),
          );
        }

        if (successData.errors.length) {
          handleErrors(successData.errors);
        } else {
          setIsError(false);
          close();
          setFormValues(DEFAULT_FORM_VALUES);
        }
      },
    });
  };
  const handleClose = () => {
    setFormValues(DEFAULT_FORM_VALUES);
    setIsError(false);
    close();
  };

  return (
    <>
      <Button
        key="authz-header-action-new-team-member"
        iconBefore={Plus}
        onClick={open}
      >
        {intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
      </Button>

      {isOpen && (
        <AddNewTeamMemberModal
          isOpen={isOpen}
          isError={isError}
          close={handleClose}
          onSave={handleAddTeamMember}
          isLoading={isAssignTeamMembersRolePending}
          formValues={formValues}
          handleChangeForm={handleChangeForm}
        />
      )}

      {additionMessage && (
        <Toast
          onClose={() => setAdditionMessage(null)}
          show={!!additionMessage}
        >
          {additionMessage}
        </Toast>
      )}
    </>
  );
};

export default AddNewTeamMemberTrigger;
