import { render, screen, fireEvent } from '@testing-library/react';
import RolesPermissions from './RolesPermissions';

// Mock i18n
jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage || 'translated',
  }),
  defineMessages: (msgs) => msgs,
}));

// Mock messages
jest.mock('../libraries-manager/messages', () => ({
  'library.authz.tabs.permissionsRoles.courses.alert.title': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.title',
    defaultMessage: 'Course Roles',
  },
  'library.authz.tabs.permissionsRoles.courses.alert.description': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.description',
    defaultMessage: 'Description text',
  },
  'library.authz.tabs.permissionsRoles.courses.alert.link': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.link',
    defaultMessage: 'Learn more',
  },
}));

// Mock utils
jest.mock('../libraries-manager/utils', () => ({
  buildPermissionMatrixByResource: jest.fn(() => [
    {
      key: 'test-resource',
      label: 'Test Resource',
      description: 'Test description',
      permissions: [],
    },
  ]),
}));

// Mock constants
jest.mock('../courses/constants', () => ({
  rolesObject: [
    {
      name: 'Course Admin', role: 'admin', permissions: [], userCount: 1,
    },
  ],
  coursePermissions: [],
  courseResourceTypes: [],
}));

jest.mock('../libraries-manager/constants', () => ({
  rolesLibraryObject: [
    {
      name: 'Library Admin', role: 'admin', permissions: [], userCount: 1,
    },
  ],
  libraryPermissions: [],
  libraryResourceTypes: [],
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  Hyperlink: ({ children, ...props }:
  React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => <a {...props}>{children}</a>,
}));

jest.mock('../components/PermissionTable', () => function MockPermissionTable({ title }: { title: string }) {
  return <div data-testid="permission-table">{title}</div>;
});

jest.mock('../components/AnchorButton', () => function MockAnchorButton() {
  return <div data-testid="anchor-button" />;
});

describe('RolesPermissions', () => {
  it('renders without crashing', () => {
    render(<RolesPermissions />);
    expect(screen.getByRole('button', { name: 'Courses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Libraries' })).toBeInTheDocument();
  });

  it('shows Courses tab as active by default', () => {
    render(<RolesPermissions />);
    const coursesButton = screen.getByRole('button', { name: 'Courses' });
    const librariesButton = screen.getByRole('button', { name: 'Libraries' });
    expect(coursesButton).toHaveClass('btn-primary');
    expect(librariesButton).toHaveClass('btn-outline-primary');
    expect(screen.getByTestId('permission-table')).toHaveTextContent('Course Roles');
  });

  it('switches tabs when clicked', () => {
    render(<RolesPermissions />);
    const coursesButton = screen.getByRole('button', { name: 'Courses' });
    const librariesButton = screen.getByRole('button', { name: 'Libraries' });
    fireEvent.click(librariesButton);
    expect(librariesButton).toHaveClass('btn-primary');
    expect(coursesButton).toHaveClass('btn-outline-primary');
    expect(screen.getByTestId('permission-table')).toHaveTextContent('Library Roles');
    fireEvent.click(coursesButton);
    expect(coursesButton).toHaveClass('btn-primary');
    expect(librariesButton).toHaveClass('btn-outline-primary');
    expect(screen.getByTestId('permission-table')).toHaveTextContent('Course Roles');
  });
});
