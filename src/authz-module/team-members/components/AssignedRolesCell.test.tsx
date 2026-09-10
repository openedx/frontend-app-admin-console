import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import type { TeamMember, TeamMemberAssignment } from '@src/types';
import AssignedRolesCell from './AssignedRolesCell';

const courseAssignment: TeamMemberAssignment = {
  role: 'course_staff',
  org: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+DemoCourse',
  scopeDisplayName: 'Open edX Demo Course',
  permissionCount: 27,
};

const rowFor = (assignments: TeamMemberAssignment[], overrides: Partial<TeamMember> = {}) => ({
  row: {
    original: {
      username: 'johndoe',
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      assignmentCount: assignments.length,
      assignments,
      ...overrides,
    },
  },
});

describe('AssignedRolesCell', () => {
  it('names the role, the scope it applies to, and the organization', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([courseAssignment])} />);

    expect(screen.getByText('Course Staff')).toBeInTheDocument();
    expect(screen.getByText('Open edX Demo Course')).toBeInTheDocument();
    expect(screen.getByText('OpenedX')).toBeInTheDocument();
  });

  it('shows only the first assignment when the user has several', () => {
    const libraryAssignment: TeamMemberAssignment = {
      role: 'library_admin',
      org: 'WGU',
      scope: 'lib:WGU:CSPROB',
      scopeDisplayName: 'Computer Science Problems',
      permissionCount: 11,
    };
    renderWrapper(<AssignedRolesCell {...rowFor([courseAssignment, libraryAssignment])} />);

    expect(screen.getByText('Course Staff')).toBeInTheDocument();
    expect(screen.queryByText('Library Admin')).not.toBeInTheDocument();
  });

  it('falls back to the scope id when the API resolved no display name', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{ ...courseAssignment, scopeDisplayName: '' }])} />);

    expect(screen.getByText('course-v1:OpenedX+DemoX+DemoCourse')).toBeInTheDocument();
  });

  it('names a platform-wide course scope instead of showing its wildcard key', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{
      ...courseAssignment, role: 'course_admin', org: '*', scope: 'course-v1:*', scopeDisplayName: '',
    }])}
    />);

    expect(screen.getByText('All courses on the platform')).toBeInTheDocument();
    expect(screen.getByText('All Organizations')).toBeInTheDocument();
    expect(screen.queryByText('course-v1:*')).not.toBeInTheDocument();
  });

  it('names a platform-wide library scope', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{
      ...courseAssignment, role: 'library_admin', org: '*', scope: 'lib:*', scopeDisplayName: '',
    }])}
    />);

    expect(screen.getByText('All libraries on the platform')).toBeInTheDocument();
  });

  it('names an organization-wide course scope, keeping the organization on its own line', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{
      ...courseAssignment, role: 'course_admin', org: 'MathDept', scope: 'course-v1:MathDept+*', scopeDisplayName: '',
    }])}
    />);

    expect(screen.getByText('All courses in this organization')).toBeInTheDocument();
    expect(screen.getByText('MathDept')).toBeInTheDocument();
  });

  it('names an organization-wide library scope', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{
      ...courseAssignment, role: 'library_admin', org: 'MathDept', scope: 'lib:MathDept:*', scopeDisplayName: '',
    }])}
    />);

    expect(screen.getByText('All libraries in this organization')).toBeInTheDocument();
  });

  it('shows the raw role key when the API sends a role the UI has no label for', () => {
    renderWrapper(<AssignedRolesCell {...rowFor([{ ...courseAssignment, role: 'course_unmapped' }])} />);

    expect(screen.getByText('course_unmapped')).toBeInTheDocument();
  });

  it('renders nothing for a user whose assignments were not returned', () => {
    const { container } = renderWrapper(
      <AssignedRolesCell {...rowFor([], { assignmentCount: 4 })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
