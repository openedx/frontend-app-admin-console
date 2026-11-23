import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/testUtils';
import messages from '../messages';
import MemberActionCell from './MemberActionCell';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockMember = {
  username: 'instructor1',
  fullName: 'Instructor One',
  email: 'instructor1@example.com',
  role: 'custom-role-123',
  org: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+Demo',
  scopeDisplayName: 'Demo Course',
  permissionCount: 5,
};

const mockRow = {
  id: '1',
  original: mockMember,
};

const renderActionCell = (props = {}) => renderWrapper(
  <MemberActionCell
    row={mockRow}
    onClickDeleteButton={jest.fn()}
    {...props}
  />,
);

describe('MemberActionCell', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders view button', () => {
    renderActionCell();
    const expectedName = messages['authz.role.members.table.action.view.alt'].defaultMessage.replace('{username}', mockMember.username);
    expect(screen.getByRole('button', { name: expectedName })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    renderActionCell();
    const expectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', mockMember.username);
    expect(screen.getByRole('button', { name: expectedName })).toBeInTheDocument();
  });

  it('view button has primary variant', () => {
    renderActionCell();
    const expectedName = messages['authz.role.members.table.action.view.alt'].defaultMessage.replace('{username}', mockMember.username);
    const viewButton = screen.getByRole('button', { name: expectedName });

    // Check that the button has the primary styling applied
    expect(viewButton).toHaveClass('btn-icon-primary');
  });

  it('delete button has danger variant', () => {
    renderActionCell();
    const expectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', mockMember.username);
    const deleteButton = screen.getByRole('button', { name: expectedName });

    // Check that the button has the danger styling applied
    expect(deleteButton).toHaveClass('btn-icon-danger');
  });

  it('calls navigate when view button is clicked', async () => {
    const user = userEvent.setup();
    renderActionCell();

    const expectedName = messages['authz.role.members.table.action.view.alt'].defaultMessage.replace('{username}', mockMember.username);
    const viewButton = screen.getByRole('button', { name: expectedName });
    await user.click(viewButton);

    // Should navigate to audit-user page for the member
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('instructor1'),
    );
  });

  it('calls onClickDeleteButton when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDelete = jest.fn();

    renderActionCell({ onClickDeleteButton: mockOnDelete });

    const expectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', mockMember.username);
    const deleteButton = screen.getByRole('button', { name: expectedName });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockMember);
  });

  it('renders both buttons in a row layout', () => {
    const { container } = renderActionCell();
    const buttonsContainer = container.querySelector('.d-flex.gap-2');

    expect(buttonsContainer).toBeInTheDocument();
    expect(buttonsContainer?.children.length).toBe(2);
  });

  it('buttons are centered horizontally', () => {
    const { container } = renderActionCell();
    const buttonsContainer = container.querySelector('.justify-content-center');

    expect(buttonsContainer).toBeInTheDocument();
  });

  it('renders small-sized buttons', () => {
    renderActionCell();
    const viewExpectedName = messages['authz.role.members.table.action.view.alt'].defaultMessage.replace('{username}', mockMember.username);
    const deleteExpectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', mockMember.username);
    const viewButton = screen.getByRole('button', { name: viewExpectedName });
    const deleteButton = screen.getByRole('button', { name: deleteExpectedName });

    // Both buttons should have size="sm" applied (shows as btn-icon-sm for IconButton)
    expect(viewButton).toHaveClass('btn-icon-sm');
    expect(deleteButton).toHaveClass('btn-icon-sm');
  });

  it('handles multiple rapid delete clicks correctly', async () => {
    const user = userEvent.setup();
    const mockOnDelete = jest.fn();

    renderActionCell({ onClickDeleteButton: mockOnDelete });

    const expectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', mockMember.username);
    const deleteButton = screen.getByRole('button', { name: expectedName });

    await user.click(deleteButton);
    await user.click(deleteButton);

    // Should be called twice
    expect(mockOnDelete).toHaveBeenCalledTimes(2);
  });

  it('renders with different member data', () => {
    const differentMember = {
      username: 'instructor2',
      fullName: 'Instructor Two',
      email: 'instructor2@example.com',
      role: 'custom-role-456',
      org: 'WGU',
      scope: 'course-v1:WGU+Math+101',
      scopeDisplayName: 'Math 101',
      permissionCount: 3,
    };

    renderWrapper(
      <MemberActionCell
        row={{ id: '2', original: differentMember }}
        onClickDeleteButton={jest.fn()}
      />,
    );

    const viewExpectedName = messages['authz.role.members.table.action.view.alt'].defaultMessage.replace('{username}', differentMember.username);
    const deleteExpectedName = messages['authz.role.members.table.action.delete.alt'].defaultMessage.replace('{username}', differentMember.username);
    expect(screen.getByRole('button', { name: viewExpectedName })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: deleteExpectedName })).toBeInTheDocument();
  });
});
