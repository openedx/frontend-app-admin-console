import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import RoleCard from '.';

jest.mock('@openedx/paragon/icons', () => ({
  Delete: () => <svg data-testid="delete-icon" />,
  Person: () => <svg data-testid="person-icon" />,
}));

jest.mock('./constants', () => ({
  actionsDictionary: {
    view: () => <svg data-testid="view-icon" />,
    manage: () => <svg data-testid="manage-icon" />,
  },
}));

describe('RoleCard', () => {
  const defaultProps = {
    title: 'Admin',
    objectName: 'Test Library',
    description: 'Can manage everything',
    showDelete: true,
    userCounter: 2,
    permissions: [
      {
        key: 'library',
        label: 'Library Resource',
        actions: [
          { key: 'view', label: 'View' },
          { key: 'manage', label: 'Manage', disabled: true },
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
    expect(screen.getByTestId('person-icon')).toBeInTheDocument();

    // Subtitle (object name)
    expect(screen.getByText('Test Library')).toBeInTheDocument();

    // Description
    expect(screen.getByText('Can manage everything')).toBeInTheDocument();

    // Delete button
    expect(screen.getByRole('button', { name: /delete role action/i })).toBeInTheDocument();

    // Collapsible title
    expect(screen.getByText('Permissions')).toBeInTheDocument();

    await user.click(screen.getByText('Permissions'));

    // Resource label
    expect(screen.getByText('Library Resource')).toBeInTheDocument();

    // Action chips
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();

    // Action icons
    expect(screen.getByTestId('view-icon')).toBeInTheDocument();
    expect(screen.getByTestId('manage-icon')).toBeInTheDocument();
  });

  it('does not show delete button when showDelete is false', () => {
    renderWrapper(<RoleCard {...defaultProps} showDelete={false} />);
    expect(screen.queryByRole('button', { name: /delete role action/i })).not.toBeInTheDocument();
  });

  it('handles no userCounter gracefully', () => {
    renderWrapper(<RoleCard {...defaultProps} userCounter={null} />);
    expect(screen.queryByTestId('person-icon')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('handles empty permissions gracefully', () => {
    renderWrapper(<RoleCard {...defaultProps} permissions={[]} />);
    expect(screen.queryByText('Library Resource')).not.toBeInTheDocument();
  });
});
