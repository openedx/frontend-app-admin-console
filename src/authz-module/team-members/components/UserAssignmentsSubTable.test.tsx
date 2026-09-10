import { screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import type { TeamMember, TeamMemberAssignment } from '@src/types';
import UserAssignmentsSubTable from './UserAssignmentsSubTable';

const courseAssignment: TeamMemberAssignment = {
  role: 'course_staff',
  org: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+DemoCourse',
  scopeDisplayName: 'Open edX Demo Course',
  permissionCount: 27,
};

const libraryAssignment: TeamMemberAssignment = {
  role: 'library_admin',
  org: 'WGU',
  scope: 'lib:WGU:CSPROB',
  scopeDisplayName: 'Computer Science Problems',
  permissionCount: 11,
};

const rowFor = (assignments: TeamMemberAssignment[], assignmentCount = assignments.length) => ({
  row: {
    original: {
      username: 'johndoe',
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      assignmentCount,
      assignments,
    } as TeamMember,
  },
});

describe('UserAssignmentsSubTable', () => {
  it('lists one row per returned assignment, in the order the API sent them', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([courseAssignment, libraryAssignment])} />);

    const rows = screen.getAllByRole('row').slice(1); // drop the header row
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Course Staff')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Library Admin')).toBeInTheDocument();
  });

  it('names each scope and organization', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([courseAssignment])} />);

    expect(screen.getByText('Open edX Demo Course')).toBeInTheDocument();
    expect(screen.getByText('OpenedX')).toBeInTheDocument();
  });

  it('falls back to the scope id when the API resolved no display name', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([{ ...courseAssignment, scopeDisplayName: '' }])} />);

    expect(screen.getByText('course-v1:OpenedX+DemoX+DemoCourse')).toBeInTheDocument();
  });

  it('names wildcard scopes instead of showing their keys', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([
      {
        ...courseAssignment, role: 'course_admin', org: '*', scope: 'course-v1:*', scopeDisplayName: '',
      },
      {
        ...libraryAssignment, role: 'library_admin', org: '*', scope: 'lib:*', scopeDisplayName: '',
      },
      {
        ...courseAssignment, role: 'course_admin', org: 'MathDept', scope: 'course-v1:MathDept+*', scopeDisplayName: '',
      },
      {
        ...libraryAssignment, role: 'library_admin', org: 'MathDept', scope: 'lib:MathDept:*', scopeDisplayName: '',
      },
    ])}
    />);

    expect(screen.getByText('All courses on the platform')).toBeInTheDocument();
    expect(screen.getByText('All libraries on the platform')).toBeInTheDocument();
    expect(screen.getByText('All courses in this organization')).toBeInTheDocument();
    expect(screen.getByText('All libraries in this organization')).toBeInTheDocument();
    expect(screen.getAllByText('All Organizations')).toHaveLength(2);
    expect(screen.queryByText('course-v1:*')).not.toBeInTheDocument();
  });

  it('reports how many of the user total are listed', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([courseAssignment, libraryAssignment], 7)} />);

    expect(screen.getByText('Showing 02 of 07')).toBeInTheDocument();
  });

  it('offers the audit page when the listing is truncated', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([courseAssignment], 7)} />);

    expect(screen.getByRole('link', { name: /View all roles/ }))
      .toHaveAttribute('href', '/authz/user/johndoe');
  });

  it('omits the audit link when every role is already listed', () => {
    renderWrapper(<UserAssignmentsSubTable {...rowFor([courseAssignment, libraryAssignment])} />);

    expect(screen.getByText('Showing 02 of 02')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View all roles/ })).not.toBeInTheDocument();
  });
});
