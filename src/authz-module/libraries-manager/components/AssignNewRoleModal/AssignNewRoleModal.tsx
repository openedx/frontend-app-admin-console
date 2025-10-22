import { FC } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Form, ModalDialog,
} from '@openedx/paragon';
import { Role } from 'types';
import messages from '../messages';

interface AssignNewRoleModalProps {
  isOpen: boolean;
  isLoading: boolean;
  roleOptions: Role[];
  selectedRole: string;
  close: () => void;
  onSave: () => void;
  handleChangeSelectedRole: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const AssignNewRoleModal: FC<AssignNewRoleModalProps> = ({
  isOpen, isLoading, selectedRole, roleOptions, close, onSave, handleChangeSelectedRole,
}) => {
  const intl = useIntl();
  return (
    <ModalDialog
      title={intl.formatMessage(messages['libraries.authz.manage.assign.new.role.title'])}
      isOpen={isOpen}
      onClose={isLoading ? () => {} : close}
      size="lg"
      variant="dark"
      hasCloseButton
      isOverflowVisible={false}
      zIndex={5}
    >
      <ModalDialog.Header className="bg-primary-500 text-light-100">
        <ModalDialog.Title>
          {intl.formatMessage(messages['libraries.authz.manage.assign.new.role.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body className="my-4">
        <Form.Group controlId="role_options">
          <Form.Label>{intl.formatMessage(messages['library.authz.manage.role.select.label'])}</Form.Label>
          <Form.Control as="select" name="role" value={selectedRole} onChange={handleChangeSelectedRole}>
            <option value="" disabled>Select a role</option>
            {roleOptions.map((role) => <option key={role.role} value={role.role}>{role.name}</option>)}
          </Form.Control>
        </Form.Group>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" disabled={isLoading}>
            {intl.formatMessage(messages['libraries.authz.manage.cancel.button'])}
          </ModalDialog.CloseButton>
          <Button
            className="px-4"
            onClick={() => onSave()}
            disabled={!selectedRole || isLoading}
          >
            {isLoading
              ? intl.formatMessage(messages['libraries.authz.manage.saving.button'])
              : intl.formatMessage(messages['libraries.authz.manage.save.button'])}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AssignNewRoleModal;
