import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import AddNewTeamMemberModal from './AddNewTeamMemberModal';

// Mock the context module
jest.mock('@src/authz-module/libraries-manager/context', () => {
  const actual = jest.requireActual('@src/authz-module/libraries-manager/context');
  return {
    ...actual,
    useLibraryAuthZ: jest.fn(),
  };
});
const mockedUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamRoles: jest.fn(),
}));

const defaultProps = {
  isOpen: true,
  isLoading: false,
  formValues: {
    users: '',
    role: '',
  },
  close: jest.fn(),
  onSave: jest.fn(),
  handleChangeForm: jest.fn(),
};

const mockRoles = [
  {
    role: 'instructor',
    name: 'instructor',
    description: 'Can create and edit content',
    userCount: 3,
    objects: [
      {
        object: 'library',
        description: 'Library permissions',
        actions: ['view', 'edit', 'delete'],
      },
    ],
  },
  {
    role: 'admin',
    name: 'admin',
    description: 'Full access to the library',
    userCount: 1,
    objects: [
      {
        object: 'library',
        description: 'Library permissions',
        actions: ['view', 'edit', 'delete', 'manage'],
      },
    ],
  },
];

describe('AddNewTeamMemberModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLibraryAuthZ.mockReturnValue({
      username: 'testuser',
      libraryId: 'lib123',
      roles: mockRoles,
      canManageTeam: true,
    });
  });

  const renderModal = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return renderWrapper(
      <AddNewTeamMemberModal {...finalProps} />,
    );
  };

  describe('Modal Rendering', () => {
    it('renders the modal when isOpen is true', () => {
      renderModal();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Team Member')).toBeInTheDocument();
    });

    it('does not render the modal when isOpen is false', () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('renders the users textarea with correct label', () => {
      renderModal();

      expect(screen.getByLabelText('Add users by username or email')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /add users by username or email/i })).toBeInTheDocument();
    });

    it('renders the role select dropdown with correct label', () => {
      renderModal();

      expect(screen.getByLabelText('Roles')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /roles/i })).toBeInTheDocument();
    });

    it('renders role options correctly', () => {
      renderModal();

      expect(screen.getByText('Select a role')).toBeInTheDocument();
      mockRoles.forEach((role) => {
        expect(screen.getByText(role.role)).toBeInTheDocument();
      });
    });

    it('displays form values correctly', () => {
      renderModal({
        formValues: {
          users: 'user1@example.com, user2@example.com',
          role: 'instructor',
        },
      });

      expect(screen.getByDisplayValue('user1@example.com, user2@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('instructor')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('calls handleChangeForm when users textarea changes', async () => {
      const user = userEvent.setup();
      const handleChangeForm = jest.fn();
      renderModal({ handleChangeForm });

      const usersTextarea = screen.getByRole('textbox', { name: /add users by username or email/i });
      await user.type(usersTextarea, 'test@example.com');

      expect(handleChangeForm).toHaveBeenCalled();
    });

    it('calls handleChangeForm when role select changes', async () => {
      const user = userEvent.setup();
      const handleChangeForm = jest.fn();
      renderModal({ handleChangeForm });

      const roleSelect = screen.getByRole('combobox', { name: /roles/i });
      await user.selectOptions(roleSelect, 'instructor');

      expect(handleChangeForm).toHaveBeenCalled();
    });
  });

  describe('Modal Actions', () => {
    it('renders Cancel and Save buttons', () => {
      renderModal();

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('calls close function when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const close = jest.fn();
      renderModal({ close });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(close).toHaveBeenCalledTimes(1);
    });

    it('calls onSave function when Save button is clicked', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      renderModal({
        onSave,
        formValues: {
          users: 'test@example.com',
          role: 'instructor',
        },
      });

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('disables Save button when users field is empty', () => {
      renderModal({
        formValues: {
          users: '',
          role: 'instructor',
        },
      });

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('disables Save button when role field is empty', () => {
      renderModal({
        formValues: {
          users: 'test@example.com',
          role: '',
        },
      });

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('enables Save button when both fields are filled', () => {
      renderModal({
        formValues: {
          users: 'test@example.com',
          role: 'instructor',
        },
      });

      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('disables Cancel button when loading', () => {
      renderModal({ isLoading: true });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('disables Save button when loading', () => {
      renderModal({
        isLoading: true,
        formValues: {
          users: 'test@example.com',
          role: 'instructor',
        },
      });

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });
});
