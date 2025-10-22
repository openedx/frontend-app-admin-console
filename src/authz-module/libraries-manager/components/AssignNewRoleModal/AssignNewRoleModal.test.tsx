import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { Role } from 'types';
import AssignNewRoleModal from './AssignNewRoleModal';

describe('AssignNewRoleModal', () => {
  const defaultProps = {
    isOpen: true,
    isLoading: false,
    roleOptions: [
      {
        role: 'instructor',
        name: 'Instructor',
        description: 'Can create and edit content',
        userCount: 5,
        permissions: ['view', 'edit'],
      },
      {
        role: 'admin',
        name: 'Administrator',
        description: 'Full access to the library',
        userCount: 2,
        permissions: ['view', 'edit', 'delete', 'manage'],
      },
      {
        role: 'viewer',
        name: 'Viewer',
        description: 'Can only view content',
        userCount: 10,
        permissions: ['view'],
      },
    ] as Role[],
    selectedRole: '',
    close: jest.fn(),
    onSave: jest.fn(),
    handleChangeSelectedRole: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return renderWrapper(<AssignNewRoleModal {...finalProps} />);
  };

  describe('Modal Visibility', () => {
    it('renders modal when isOpen is true', () => {
      renderComponent({ isOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Role')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderComponent({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Add New Role')).not.toBeInTheDocument();
    });
  });

  describe('Modal Structure', () => {
    it('renders modal header with correct title', () => {
      renderComponent({ isOpen: true });

      expect(screen.getByText('Add New Role')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders close button in header', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('Role Selection Form', () => {
    it('renders role selection form with correct label', () => {
      renderComponent();

      expect(screen.getByText('Roles')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders default option', () => {
      renderComponent();

      expect(screen.getByText('Select a role')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Select a role' })).toBeDisabled();
    });

    it('renders all role options', () => {
      renderComponent();

      defaultProps.roleOptions.forEach((role) => {
        expect(screen.getByRole('option', { name: role.name })).toBeInTheDocument();
      });
    });

    it('displays selected role correctly', () => {
      renderComponent({ selectedRole: 'instructor' });

      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveValue('instructor');
    });

    it('calls handleChangeSelectedRole when role selection changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      const selectElement = screen.getByRole('combobox');
      await user.selectOptions(selectElement, 'admin');

      expect(defaultProps.handleChangeSelectedRole).toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('renders Cancel button with correct text', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders Save button with correct text when not loading', () => {
      renderComponent({ isLoading: false });

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('renders Save button with loading text when loading', () => {
      renderComponent({ isLoading: true });

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('calls close when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(defaultProps.close).toHaveBeenCalledTimes(1);
    });

    it('calls onSave when Save button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ selectedRole: 'instructor' });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('disables Save button when no role is selected', () => {
      renderComponent({ selectedRole: '' });

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('enables Save button when role is selected and not loading', () => {
      renderComponent({ selectedRole: 'instructor', isLoading: false });

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('disables Save button when loading', () => {
      renderComponent({ selectedRole: 'instructor', isLoading: true });

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();
    });

    it('disables Cancel button when loading', () => {
      renderComponent({ isLoading: true });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('enables Cancel button when not loading', () => {
      renderComponent({ isLoading: false });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Modal Close Behavior', () => {
    it('does not call close when modal header close is clicked during loading', async () => {
      const user = userEvent.setup();
      renderComponent({ isLoading: true });

      const headerCloseButton = screen.getByRole('button', { name: /close/i });
      await user.click(headerCloseButton);

      expect(defaultProps.close).not.toHaveBeenCalled();
    });

    it('calls close when modal header close is clicked and not loading', async () => {
      const user = userEvent.setup();
      renderComponent({ isLoading: false });

      const headerCloseButton = screen.getByRole('button', { name: /close/i });
      await user.click(headerCloseButton);

      expect(defaultProps.close).toHaveBeenCalledTimes(1);
    });
  });
});
