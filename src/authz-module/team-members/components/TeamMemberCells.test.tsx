import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import { EmailCell, NameCell } from './TeamMemberCells';

describe('NameCell', () => {
  const teamMember = {
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'johndoe@example.com',
    assignmentCount: 1,
    assignments: [],
  };
  const mockCellProps = {
    row: {
      id: '0',
      original: teamMember,
    },
  };
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      },
    });
  });

  it('displays the username, never the full name', () => {
    renderWrapper(<NameCell {...mockCellProps} />);
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('renders nothing when the user has no username', () => {
    const propsWithBlankUsername = {
      row: {
        id: '0',
        original: {
          ...teamMember,
          username: '',
        },
      },
    };

    renderWrapper(<NameCell {...propsWithBlankUsername} />);
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows current user indicator when username matches authenticated user', () => {
    const currentUserProps = {
      row: {
        id: '0',
        original: {
          ...teamMember,
          username: 'testuser',
          fullName: 'Test User',
        },
      },
    };

    renderWrapper(<NameCell {...currentUserProps} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText(/\(Me\)/)).toBeInTheDocument();
  });

  it('does not show current user indicator when username does not match authenticated user', () => {
    renderWrapper(<NameCell {...mockCellProps} />);
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.queryByText(/\(Me\)/)).not.toBeInTheDocument();
  });

  it('handles missing username in authenticated user gracefully', () => {
    const contextWithoutUsername = {
      authenticatedUser: {
        username: undefined,
        email: 'testuser@example.com',
      },
    };

    renderWrapper(<NameCell {...mockCellProps} />, contextWithoutUsername);
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.queryByText(/\(Me\)/)).not.toBeInTheDocument();
  });
});

describe('EmailCell', () => {
  it('displays the email address', () => {
    renderWrapper(<EmailCell value="johndoe@example.com" />);
    expect(screen.getByText('johndoe@example.com')).toBeInTheDocument();
  });
});
