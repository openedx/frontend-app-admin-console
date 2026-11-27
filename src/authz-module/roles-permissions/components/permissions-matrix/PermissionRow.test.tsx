import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import { buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import PermissionRow from './PermissionRow';

const renderRow = (description: string, requiredByNames?: string[]) => renderWrapper(
  <PermissionRow
    permission={buildCatalogPermission('view', { displayName: 'View course', description, categoryId: 'course' })}
    isOn={false}
    requiredByNames={requiredByNames}
    onToggle={jest.fn()}
  />,
);

describe('PermissionRow', () => {
  it('describes the switch by its description', () => {
    renderRow('See the course');
    expect(screen.getByRole('switch', { name: 'View course' })).toHaveAccessibleDescription('See the course');
  });

  it('has no description to point to when the permission has none', () => {
    renderRow('');
    expect(screen.getByRole('switch', { name: 'View course' })).not.toHaveAttribute('aria-describedby');
  });

  it('locks the switch and names who needs it', () => {
    renderRow('See the course', ['Edit course']);
    const permissionSwitch = screen.getByRole('switch', { name: 'View course' });
    expect(permissionSwitch).toBeDisabled();
    expect(permissionSwitch).toHaveAccessibleDescription(/Auto-enabled · Required by 'Edit course'/);
  });
});
