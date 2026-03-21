import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import { useNavigate } from 'react-router-dom';

interface AddRoleButtonProps {
  presetUsername?: string;
}

const AddRoleButton = ({ presetUsername }: AddRoleButtonProps) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const handleClick = () => {
    const assignRolePath = `/authz/assign-role${presetUsername ? `?username=${presetUsername}` : ''}`;
    navigate(assignRolePath);
  };

  return (
    <Button
      iconBefore={Plus}
      onClick={handleClick}
    >
      {intl.formatMessage(baseMessages['authz.management.assign.role.title'])}
    </Button>
  );
};

export default AddRoleButton;
