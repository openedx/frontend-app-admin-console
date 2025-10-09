import { FC } from 'react';
import {
  ActionRow, Icon, ModalDialog, Stack,
  StatefulButton,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { SpinnerSimple } from '@openedx/paragon/icons';
import messages from './messages';

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  close: () => void;
  onSave: () => void;
  isDeleting?: boolean;
  context: {
    userName: string;
    scope: string;
    role: string;
    rolesCount: number;
  }
}

const ConfirmDeletionModal: FC<ConfirmDeletionModalProps> = ({
  isOpen, close, onSave, isDeleting, context,
}) => {
  const intl = useIntl();
  return (
    <ModalDialog
      title={intl.formatMessage(messages['library.authz.team.remove.user.modal.title'])}
      isOpen={isOpen}
      onClose={close}
      size="lg"
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title className="text-primary-500">
          {intl.formatMessage(messages['library.authz.team.remove.user.modal.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <Stack gap={3}>
          <p>{intl.formatMessage(messages['library.authz.team.remove.user.modal.body.1'], {
            userName: context.userName,
            scope: context.scope,
            role: context.role,
          })}
          </p>
          {context.rolesCount === 1 && (
            <p>{intl.formatMessage(messages['library.authz.team.remove.user.modal.body.2'])}</p>
          )}
          <p>{intl.formatMessage(messages['library.authz.team.remove.user.modal.body.3'])}</p>
        </Stack>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages['libraries.authz.manage.cancel.button'])}
          </ModalDialog.CloseButton>
          <StatefulButton
            className="px-4"
            variant="danger"
            labels={{
              default: intl.formatMessage(messages['libraries.authz.manage.save.button']),
              pending: intl.formatMessage(messages['libraries.authz.manage.saving.button']),
            }}
            icons={{
              pending: <Icon src={SpinnerSimple} />,
            }}
            state={isDeleting ? 'pending' : 'default'}
            onClick={() => onSave()}
            disabledStates={['pending']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ConfirmDeletionModal;
