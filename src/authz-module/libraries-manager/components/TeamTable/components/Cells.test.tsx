import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import {
  EmailCell,
  NameCell,
  ActionCell,
  RolesCell,
} from './Cells';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@src/authz-module/libraries-manager/context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamMembers: jest.fn(),
}));

jest.mock('../hooks/useQuerySettings', () => ({
  useQuerySettings: jest.fn(() => ({
    querySettings: { page: 1, limit: 10 },
  })),
}));

const mockNavigate = useNavigate as jest.Mock;
const mockUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;
const mockUseTeamMembers = useTeamMembers as jest.Mock;

const renderWithIntl = (component: React.ReactElement) => render(
  <IntlProvider locale="en" messages={{}}>
    {component}
  </IntlProvider>,
);

const mockTeamMember = {
  username: 'john.doe',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  roles: ['instructor', 'author'],
  createdAt: '2023-01-01T00:00:00Z',
};

const mockSkeletonMember = {
  username: 'skeleton',
  fullName: '',
  email: '',
  roles: [],
  createdAt: '',
};

const mockCellProps = {
  row: { original: mockTeamMember },
};

const mockSkeletonCellProps = {
  row: { original: mockSkeletonMember },
};

describe('Table Cells', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLibraryAuthZ.mockReturnValue({
      username: 'current.user',
      libraryId: 'lib123',
      canManageTeam: true,
      roles: [
        { role: 'instructor', name: 'Instructor' },
        { role: 'author', name: 'Author' },
      ],
    });
    mockUseTeamMembers.mockReturnValue({ isLoading: false });
    mockNavigate.mockReturnValue(jest.fn());
  });

  describe('EmailCell', () => {
    it('displays user email', () => {
      renderWithIntl(<EmailCell {...mockCellProps} />);
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
    it('shows loading skeleton for loading state', () => {
      renderWithIntl(<EmailCell {...mockSkeletonCellProps} />);
      expect(document.querySelector('.react-loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('NameCell', () => {
    it('displays username for regular user', () => {
      renderWithIntl(<NameCell {...mockCellProps} />);
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    it('displays current user indicator for logged in user', () => {
      const currentUserProps = {
        ...mockCellProps,
        row: { original: { ...mockTeamMember, username: 'current.user' } },
      };
      renderWithIntl(<NameCell {...currentUserProps} />);
      expect(screen.getByText('current.user')).toBeInTheDocument();
      expect(screen.getByText('current.user').parentElement).toBeInTheDocument();
    });
    it('shows loading skeleton for loading state', () => {
      renderWithIntl(<NameCell {...mockSkeletonCellProps} />);
      expect(document.querySelector('.react-loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('ActionCell', () => {
    it('renders edit button for manageable team member', () => {
      renderWithIntl(<ActionCell {...mockCellProps} />);
      const editButton = screen.getByRole('button');
      expect(editButton).toBeInTheDocument();
      expect(document.querySelector('.pgn__icon')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('navigates to user page when edit button is clicked', async () => {
      const user = userEvent.setup();
      const navigateMock = jest.fn();
      mockNavigate.mockReturnValue(navigateMock);
      renderWithIntl(<ActionCell {...mockCellProps} />);
      const editButton = screen.getByRole('button');
      await user.click(editButton);
      expect(navigateMock).toHaveBeenCalledWith('/authz/libraries/lib123/john.doe');
    });

    it('does not render edit button for current user', () => {
      const currentUserProps = {
        ...mockCellProps,
        row: { original: { ...mockTeamMember, username: 'current.user' } },
      };
      renderWithIntl(<ActionCell {...currentUserProps} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render edit button when user cannot manage team', () => {
      mockUseLibraryAuthZ.mockReturnValue({
        username: 'current.user',
        libraryId: 'lib123',
        canManageTeam: false,
        roles: [],
      });
      renderWithIntl(<ActionCell {...mockCellProps} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render edit button during loading', () => {
      mockUseTeamMembers.mockReturnValue({ isLoading: true });

      renderWithIntl(<ActionCell {...mockCellProps} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('RolesCell', () => {
    it('displays role chips for user roles', () => {
      renderWithIntl(<RolesCell {...mockCellProps} />);
      expect(screen.getByText('Instructor')).toBeInTheDocument();
      expect(screen.getByText('Author')).toBeInTheDocument();
    });

    it('shows loading skeleton for loading state', () => {
      renderWithIntl(<RolesCell {...mockSkeletonCellProps} />);
      expect(document.querySelector('.react-loading-skeleton')).toBeInTheDocument();
    });

    it('handles user with no roles', () => {
      const noRolesProps = {
        ...mockCellProps,
        row: { original: { ...mockTeamMember, roles: [] } },
      };
      renderWithIntl(<RolesCell {...noRolesProps} />);
      expect(screen.queryByText('Instructor')).not.toBeInTheDocument();
      expect(screen.queryByText('Author')).not.toBeInTheDocument();
    });
  });
});
