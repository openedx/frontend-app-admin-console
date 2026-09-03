import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import type { TeamMember } from '@src/types';
import TeamMemberViewActionCell from './TeamMemberViewActionCell';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const courseAssignment = {
  isSuperadmin: false,
  role: 'course_staff',
  org: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+DemoCourse',
  permissionCount: 27,
};

const libraryAssignment = {
  isSuperadmin: false,
  role: 'library_admin',
  org: 'WGU',
  scope: 'lib:WGU:CSPROB',
  permissionCount: 11,
};

const teamMember: TeamMember = {
  username: 'johndoe',
  fullName: 'John Doe',
  email: 'johndoe@example.com',
  assignmentCount: 1,
  assignments: [courseAssignment],
};

const cellPropsFor = (overrides: Partial<TeamMember> = {}) => ({
  row: { original: { ...teamMember, ...overrides } },
});

describe('TeamMemberViewActionCell', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      },
    });
    mockNavigate.mockClear();
  });

  it('renders an accessible view action button', () => {
    renderWrapper(<TeamMemberViewActionCell {...cellPropsFor()} />);
    const viewButton = screen.getByRole('button', { name: /view/i });
    expect(viewButton).toBeInTheDocument();
    expect(viewButton).toHaveAttribute('aria-label');
  });

  it('navigates to the audit page for the row user', async () => {
    const user = userEvent.setup();
    renderWrapper(<TeamMemberViewActionCell {...cellPropsFor()} />);

    await user.click(screen.getByRole('button', { name: /view/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/authz/user/johndoe');
  });

  it('handles special characters in the username', async () => {
    const user = userEvent.setup();
    renderWrapper(<TeamMemberViewActionCell {...cellPropsFor({ username: 'user+with@special.chars' })} />);

    await user.click(screen.getByRole('button', { name: /view/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/authz/user/user%2Bwith%40special.chars');
  });

  it('stays enabled when at least one assignment is viewable', () => {
    renderWrapper(
      <TeamMemberViewActionCell
        {...cellPropsFor({ assignments: [courseAssignment, libraryAssignment], assignmentCount: 2 })}
        isCourseEnabled={() => false}
      />,
    );
    expect(screen.getByRole('button', { name: /view/i })).not.toBeDisabled();
  });

  it('disables the action with a tooltip when every assignment sits in a disabled course', async () => {
    const user = userEvent.setup();
    renderWrapper(<TeamMemberViewActionCell {...cellPropsFor()} isCourseEnabled={() => false} />);

    const viewButton = screen.getByRole('button', { name: /view/i });
    expect(viewButton).toBeDisabled();

    await user.hover(viewButton);
    expect(screen.getByText(/manage its team in Studio instead/i)).toBeInTheDocument();
  });

  it('never calls the flag check with a missing scope', () => {
    const isCourseEnabled = jest.fn(() => true);
    renderWrapper(
      <TeamMemberViewActionCell {...cellPropsFor({ assignments: [] })} isCourseEnabled={isCourseEnabled} />,
    );

    expect(isCourseEnabled).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /view/i })).not.toBeDisabled();
  });
});
