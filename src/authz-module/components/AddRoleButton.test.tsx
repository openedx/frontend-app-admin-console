import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWithAllProviders } from '@src/setupTest';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '../roles-permissions';
import AddRoleButton from './AddRoleButton';

// Mock react-router-dom navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  ...jest.requireActual('@src/data/hooks'),
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

const mockUseValidatePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const allowAllPermissions = {
  data: [
    { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: true },
    { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: true },
  ],
  isLoading: false,
};

describe('AddRoleButton', () => {
  const mockNavigate = jest.fn();

  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockUseValidatePermissions.mockReturnValue(allowAllPermissions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the assign role button with correct text', () => {
      renderWithAllProviders(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button).toBeInTheDocument();
    });

    it('displays the plus icon', () => {
      renderWithAllProviders(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correctly when presetUsername is provided', () => {
      renderWithAllProviders(<AddRoleButton presetUsername="testuser123" />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('navigation behavior', () => {
    it('navigates to assign role page without username when clicked', async () => {
      const user = userEvent.setup();
      renderWithAllProviders(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('navigates to assign role page with username query parameter when presetUsername is provided', async () => {
      const user = userEvent.setup();
      const presetUsername = 'john.doe';
      renderWithAllProviders(<AddRoleButton presetUsername={presetUsername} />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/authz/assign-role?users=${presetUsername}`);
    });

    it('handles special characters in presetUsername correctly', async () => {
      const user = userEvent.setup();
      const presetUsername = 'user@example.com';
      renderWithAllProviders(<AddRoleButton presetUsername={presetUsername} />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/authz/assign-role?${new URLSearchParams({ users: presetUsername }).toString()}`);
    });
  });

  describe('user interactions', () => {
    it('responds to keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithAllProviders(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('responds to spacebar activation', async () => {
      const user = userEvent.setup();
      renderWithAllProviders(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      button.focus();

      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('handles multiple clicks gracefully', async () => {
      const user = userEvent.setup();
      renderWithAllProviders(<AddRoleButton presetUsername="testuser" />);

      const button = screen.getByRole('button', { name: /assign role/i });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role?users=testuser');
    });
  });

  describe('permission gating', () => {
    it('does not render the button when the user cannot manage any team', () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [
          { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: false },
          { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: false },
        ],
        isLoading: false,
      });
      renderWithAllProviders(<AddRoleButton />);

      expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument();
    });

    it('renders the button when at least one team-management permission is allowed', () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [
          { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: false },
          { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: true },
        ],
        isLoading: false,
      });
      renderWithAllProviders(<AddRoleButton />);

      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
    });

    it('does not render the button while permissions are loading', () => {
      mockUseValidatePermissions.mockReturnValue({ data: undefined, isLoading: true });
      renderWithAllProviders(<AddRoleButton />);

      expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument();
    });
  });
});
