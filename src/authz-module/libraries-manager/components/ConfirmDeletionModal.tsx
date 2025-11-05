import {
  ActionRow, AlertModal, Icon, ModalDialog, Stack,
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

const ConfirmDeletionModal = ({
  isOpen, close, onSave, isDeleting, context,
}: ConfirmDeletionModalProps) => {
  const intl = useIntl();
  return (
    <AlertModal
      title={intl.formatMessage(messages['library.authz.team.remove.user.modal.title'])}
      isOpen={isOpen}
      onClose={close}
      size="lg"
      footerNode={(
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages['libraries.authz.manage.cancel.button'])}
          </ModalDialog.CloseButton>
          <StatefulButton
            className="px-4"
            variant="danger"
            labels={{
              default: intl.formatMessage(messages['libraries.authz.manage.remove.button']),
              pending: intl.formatMessage(messages['libraries.authz.manage.removing.button']),
            }}
            icons={{
              pending: <Icon src={SpinnerSimple} />,
            }}
            state={isDeleting ? 'pending' : 'default'}
            onClick={() => onSave()}
            disabledStates={['pending']}
          />
        </ActionRow>
      )}
      isOverflowVisible={false}
    >
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

    </AlertModal>
  );
};

export default ConfirmDeletionModal;
