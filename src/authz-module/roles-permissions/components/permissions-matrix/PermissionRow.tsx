import { useId } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Form } from '@openedx/paragon';
import type { Permission } from '@src/authz-module/catalog';
import messages from '../../messages';

interface PermissionRowProps {
  permission: Permission;
  isOn: boolean;
  requiredByNames?: string[];
  onToggle: () => void;
}

/**
 * One permission as a labeled switch with its description. A permission another chosen one
 * needs is on and locked, and says which one, so nobody wonders why the switch won't move.
 */
const PermissionRow = ({
  permission, isOn, requiredByNames, onToggle,
}: PermissionRowProps) => {
  const { formatMessage, formatList } = useIntl();
  const idPrefix = useId();
  const descriptionId = `${idPrefix}-description`;
  const lockId = `${idPrefix}-lock`;
  const isLocked = !!requiredByNames?.length;

  return (
    <div className="permission-row d-flex align-items-center justify-content-between border-top border-light-400 px-3 py-2">
      <div className="pr-4">
        <label htmlFor={idPrefix} className="small mb-0 d-block">{permission.displayName}</label>
        {permission.description && (
          <p id={descriptionId} className="x-small text-gray-500 mb-0">{permission.description}</p>
        )}
        {isLocked && (
          <p id={lockId} className="x-small text-info-500 mb-0">
            {formatMessage(messages['authz.roles.create.wizard.permissions.row.autoEnabled'], {
              requiredBy: formatList(requiredByNames.map((name) => `'${name}'`), { type: 'conjunction' }),
            })}
          </p>
        )}
      </div>
      <Form.Switch
        id={idPrefix}
        checked={isOn}
        disabled={isLocked}
        onChange={onToggle}
        aria-describedby={[permission.description ? descriptionId : null, isLocked ? lockId : null]
          .filter(Boolean).join(' ') || undefined}
      />
    </div>
  );
};

export default PermissionRow;
