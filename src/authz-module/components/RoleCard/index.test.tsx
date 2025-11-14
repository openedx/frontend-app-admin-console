import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import RoleCard from '.';

jest.mock('@openedx/paragon/icons', () => ({
  Delete: () => <svg role="img" aria-label="delete icon" />,
  Person: () => <svg role="img" aria-label="person icon" />,
}));

jest.mock('./constants', () => ({
  actionsDictionary: {
    view: () => <svg role="img" aria-label="view action icon" />,
    manage: () => <svg role="img" aria-label="manage action icon" />,
  },
}));

describe('RoleCard', () => {
  const defaultProps = {
    title: 'Admin',
    objectName: 'Test Library',
    description: 'Can manage everything',
    handleDelete: jest.fn(),
    userCounter: 2,
    permissionsByResource: [
      {
        key: 'library',
        label: 'Library Resource',
        permissions: [
          {
            key: 'view', label: 'View', actionKey: 'view', disabled: false,
          },
          {
            key: 'manage', label: 'Manage', actionKey: 'manage', disabled: true,
          },
        ],
      },
    ],
  };

  it('renders all role card sections correctly', async () => {
    const user = userEvent.setup();
    renderWrapper(<RoleCard {...defaultProps} />);

    // Title
    expect(screen.getByText('Admin')).toBeInTheDocument();

    // User counter with icon
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'person icon' })).toBeInTheDocument();

    // Subtitle (object name)
    expect(screen.getByText('Test Library')).toBeInTheDocument();

    // Description
    expect(screen.getByText('Can manage everything')).toBeInTheDocument();

    // Delete button
    expect(screen.getByRole('button', { name: /Delete role action/i })).toBeInTheDocument();

    // Collapsible title
    expect(screen.getByText('Permissions')).toBeInTheDocument();

    await user.click(screen.getByText('Permissions'));

    // Resource label
    expect(screen.getByText('Library Resource')).toBeInTheDocument();

    // Action chips
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();

    // Action icons
    expect(screen.getByRole('img', { name: 'view action icon' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'manage action icon' })).toBeInTheDocument();
  });

  it('does not show delete button when handleDelete is not passed', () => {
    renderWrapper(<RoleCard {...defaultProps} handleDelete={undefined} />);
    expect(screen.queryByRole('button', { name: /delete role action/i })).not.toBeInTheDocument();
  });

  it('handles no userCounter gracefully', () => {
    renderWrapper(<RoleCard {...defaultProps} userCounter={null} />);
    expect(screen.queryByRole('img', { name: 'person icon' })).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('handles empty permissions gracefully', () => {
    renderWrapper(<RoleCard {...defaultProps} permissionsByResource={[]} />);
    expect(screen.queryByText('Library Resource')).not.toBeInTheDocument();
  });
});
