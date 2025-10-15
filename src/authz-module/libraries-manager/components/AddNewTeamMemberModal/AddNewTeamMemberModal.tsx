import { FC, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Hyperlink, Icon, IconButton, ModalDialog,
  ModalPopup,
  Stack,
  StatefulButton,
  useToggle,
} from '@openedx/paragon';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { Info, SpinnerSimple } from '@openedx/paragon/icons';
import messages from './messages';

interface AddNewTeamMemberModalProps {
  isOpen: boolean;
  isError: boolean;
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
  isOpen, isError, isLoading, formValues, close, onSave, handleChangeForm,
}) => {
  const intl = useIntl();
  const { roles } = useLibraryAuthZ();
  const [isOpenRolesPopUp, openRolesPopUp, closeRolesPopUp] = useToggle(false);
  const targetRolesPopUpRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <ModalPopup
        hasArrow
        placement="right"
        positionRef={targetRolesPopUpRef.current}
        isOpen={isOpenRolesPopUp}
        onClose={closeRolesPopUp}
      >
        <div
          className="bg-white p-3 rounded shadow border x-small"
          style={{ textAlign: 'start' }}
        >
          <ul>
            {roles.map((role) => <li key={`role-tooltip-${role.role}`}><b>{role.name}:</b>{role.description}</li>)}
          </ul>
          <Hyperlink destination="#libraries-permissions-tab" target="_blank">{intl.formatMessage(messages['libraries.authz.manage.tooltip.roles.extra.info'])}</Hyperlink>
        </div>
      </ModalPopup>
      <ModalDialog
        title={intl.formatMessage(messages['libraries.authz.manage.add.member.title'])}
        isOpen={isOpen}
        onClose={isLoading ? () => { } : close}
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
                isInvalid={isError}
                as="textarea"
                name="users"
                rows="3"
                value={formValues.users}
                onChange={(e) => handleChangeForm(e)}
                style={{ color: isError && 'var(--pgn-color-form-feedback-invalid)' }}
              />
            </Form.Group>

            <Form.Group controlId="role_options">
              <Form.Label>
                {intl.formatMessage(messages['libraries.authz.manage.add.member.roles.label'])}
                <IconButton alt="tooptip-extra-info" size="inline" src={Info} onClick={openRolesPopUp} ref={targetRolesPopUpRef} />
              </Form.Label>
              <Form.Control as="select" name="role" value={formValues.role} onChange={(e) => handleChangeForm(e)}>
                <option value="" disabled>
                  {intl.formatMessage(messages['libraries.authz.manage.add.member.select.default'])}
                </option>
                {roles.map((role) => <option key={role.role} value={role.role}>{role.name}</option>)}
              </Form.Control>
            </Form.Group>
          </Stack>
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary" disabled={isLoading}>
              {intl.formatMessage(messages['libraries.authz.manage.cancel.button'])}
            </ModalDialog.CloseButton>
            <StatefulButton
              className="px-4"
              labels={{
                default: intl.formatMessage(messages['libraries.authz.manage.save.button']),
                pending: intl.formatMessage(messages['libraries.authz.manage.saving.button']),
              }}
              icons={{
                pending: <Icon src={SpinnerSimple} />,
              }}
              state={isLoading ? 'pending' : 'default'}
              onClick={() => onSave()}
              disabledStates={['pending']}
              disabled={isLoading || !formValues.users || !formValues.role}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

export default AddNewTeamMemberModal;
