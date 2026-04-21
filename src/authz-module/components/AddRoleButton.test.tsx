import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import AddRoleButton from './AddRoleButton';

// Mock react-router-dom navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the assign role button with correct text', () => {
      renderWrapper(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button).toBeInTheDocument();
    });

    it('displays the plus icon', () => {
      renderWrapper(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('renders correctly when presetUsername is provided', () => {
      renderWrapper(<AddRoleButton presetUsername="testuser123" />);

      const button = screen.getByRole('button', { name: /assign role/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('navigation behavior', () => {
    it('navigates to assign role page without username when clicked', async () => {
      const user = userEvent.setup();
      renderWrapper(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('navigates to assign role page with username query parameter when presetUsername is provided', async () => {
      const user = userEvent.setup();
      const presetUsername = 'john.doe';
      renderWrapper(<AddRoleButton presetUsername={presetUsername} />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/authz/assign-role?users=${presetUsername}`);
    });

    it('handles special characters in presetUsername correctly', async () => {
      const user = userEvent.setup();
      const presetUsername = 'user@example.com';
      renderWrapper(<AddRoleButton presetUsername={presetUsername} />);

      const button = screen.getByRole('button', { name: /assign role/i });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/authz/assign-role?${new URLSearchParams({ users: presetUsername }).toString()}`);
    });
  });

  describe('user interactions', () => {
    it('responds to keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWrapper(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('responds to spacebar activation', async () => {
      const user = userEvent.setup();
      renderWrapper(<AddRoleButton />);

      const button = screen.getByRole('button', { name: /assign role/i });
      button.focus();

      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role');
    });

    it('handles multiple clicks gracefully', async () => {
      const user = userEvent.setup();
      renderWrapper(<AddRoleButton presetUsername="testuser" />);

      const button = screen.getByRole('button', { name: /assign role/i });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/authz/assign-role?users=testuser');
    });
  });
});
