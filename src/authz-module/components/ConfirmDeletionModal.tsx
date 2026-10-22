import {
  ActionRow, AlertModal, Icon, ModalDialog, Stack,
  StatefulButton,
} from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';

import { SpinnerSimple } from '@openedx/paragon/icons';
import { getAggregateScopeType, getScopeContextType } from '@src/authz-module/constants';
import messages from './messages';

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  close: () => void;
  onSave: () => void;
  isDeleting?: boolean;
  context: {
    userName: string;
    scope: string;
    scopeDisplayName?: string;
    org?: string;
    role: string;
    name?: string;
    rolesCount: number;
  };
}

const ConfirmDeletionModal = ({
  isOpen, close, onSave, isDeleting, context,
}: ConfirmDeletionModalProps) => {
  const intl = useIntl();
  const values = {
    userName: context.userName,
    role: context.name ?? context.role,
    scopeType: getScopeContextType(context.scope),
    org: context.org,
  };
  // A wildcard scope names no single resource, so the question says what it reaches instead.
  const aggregateType = getAggregateScopeType(context.scope, context.org);
  let question = intl.formatMessage(messages['authz.team.remove.user.modal.body.1'], {
    ...values, scope: context.scopeDisplayName || context.scope,
  });
  if (aggregateType === 'org') {
    question = intl.formatMessage(messages['authz.team.remove.user.modal.body.1.org'], values);
  } else if (aggregateType === 'platform') {
    question = intl.formatMessage(messages['authz.team.remove.user.modal.body.1.platform'], values);
  }

  return (
    <AlertModal
      title={intl.formatMessage(messages['authz.team.remove.user.modal.title'])}
      isOpen={isOpen}
      onClose={close}
      size="lg"
      footerNode={(
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages['authz.manage.cancel.button'])}
          </ModalDialog.CloseButton>
          <StatefulButton
            className="px-4"
            variant="danger"
            labels={{
              default: intl.formatMessage(messages['authz.manage.remove.button']),
              pending: intl.formatMessage(messages['authz.manage.removing.button']),
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
        <p>{question}</p>
        {context.rolesCount === 1 && (
          <p>{intl.formatMessage(messages['authz.team.remove.user.modal.body.2'])}</p>
        )}
        <p>{intl.formatMessage(messages['authz.team.remove.user.modal.body.3'])}</p>
      </Stack>

    </AlertModal>
  );
};

export default ConfirmDeletionModal;
