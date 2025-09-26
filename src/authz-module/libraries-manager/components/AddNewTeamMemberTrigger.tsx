import React, { FC, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Toast, useToggle } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import { useAddTeamMember } from '@src/authz-module/data/hooks';
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

  const { mutate: addTeamMember, isPending: isAddingNewTeamMember } = useAddTeamMember();

  const handleChangeForm = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTeamMember = () => {
    const data = {
      users: formValues.users.split(',').map(user => user.trim()),
      role: formValues.role,
      scope: libraryId,
    };

    addTeamMember({ data }, {
      onSuccess: (successData) => {
        if (successData.completed.length) {
          setAdditionMessage(
            intl.formatMessage(
              messages['libraries.authz.manage.add.member.success'],
              { count: successData.completed.length },
            ),
          );
        }

        if (successData.errors.length) {
          setAdditionMessage((prevMessage) => (
            `${prevMessage ? `${prevMessage} ` : ''}${intl.formatMessage(
              messages['libraries.authz.manage.add.member.failure'],
              { count: successData.errors.length },
            )}`
          ));
        } else {
          close();
          setFormValues(DEFAULT_FORM_VALUES);
        }
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
        {intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
      </Button>

      {isOpen && (
        <AddNewTeamMemberModal
          isOpen={isOpen}
          close={close}
          onSave={handleAddTeamMember}
          isLoading={isAddingNewTeamMember}
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
