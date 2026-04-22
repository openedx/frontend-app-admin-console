import { Form } from '@openedx/paragon';
import { Scope } from 'types';

interface ScopeCheckboxItemProps {
  scope: Scope;
  checked: boolean;
  onToggle: (scopeId: string) => void;
}

const ScopeCheckboxItem = ({ scope, checked, onToggle }: ScopeCheckboxItemProps) => (
  <div className="my-4">
    <Form.Checkbox
      checked={checked}
      onChange={() => onToggle(scope.externalKey)}
      data-testid="toggle-scope"
    >
      {scope.displayName}
    </Form.Checkbox>
    {scope.description && (
      <small className="d-block text-muted font-italic pl-4">{scope.description}</small>
    )}
  </div>
);

export default ScopeCheckboxItem;
