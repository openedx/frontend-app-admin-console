import { FC } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Form, ModalDialog,
  Stack,
} from '@openedx/paragon';
import { useLibraryAuthZ } from 'authz-module/libraries-manager/context';
import messages from './messages';

interface AddNewTeamMemberModalProps {
  isOpen: boolean;
  isLoading: boolean;
  formValues: {
    users: string;
    role: string;
  };
  close: () => void;
  onSave: () => void;
  handleChangeForm: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const AddNewTeamMemberModal: FC<AddNewTeamMemberModalProps> = ({
  isOpen, isLoading, formValues, close, onSave, handleChangeForm,
}) => {
  const intl = useIntl();
  const { roles } = useLibraryAuthZ();
  return (
    <ModalDialog
      title={intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
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
          {intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body className="my-4">
        <Stack gap={3}>
          <p>
            {intl.formatMessage(messages['libraries.authz.manage.add.member.description'])}
          </p>

          <Form.Group controlId="users_list">
            <Form.Label>{intl.formatMessage(messages['libraries.authz.manage.add.member.users.label'])}</Form.Label>
            <Form.Control
              as="textarea"
              name="users"
              rows="3"
              value={formValues.users}
              onChange={(e) => handleChangeForm(e)}
            />
          </Form.Group>

          <Form.Group controlId="role_options">
            <Form.Label>{intl.formatMessage(messages['libraries.authz.manage.add.member.roles.label'])}</Form.Label>
            <Form.Control as="select" name="role" value={formValues.role} onChange={(e) => handleChangeForm(e)}>
              <option value="" disabled>Select a role</option>
              {roles.map(({ role }) => <option key={role}>{role}</option>)}
            </Form.Control>
          </Form.Group>
        </Stack>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" disabled={isLoading}>
            {intl.formatMessage(messages['libraries.authz.manage.add.member.cancel.button'])}
          </ModalDialog.CloseButton>
          <Button
            className="px-4"
            onClick={() => onSave()}
            disabled={!formValues.users || !formValues.role || isLoading}
          >
            {isLoading
              ? intl.formatMessage(messages['libraries.authz.manage.add.member.saving.button'])
              : intl.formatMessage(messages['libraries.authz.manage.add.member.save.button'])}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AddNewTeamMemberModal;
