import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@openedx/frontend-base';
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

const renderActionCell = (props = {}) => render(
  <IntlProvider locale="en">
    <BrowserRouter>
      <MemberActionCell
        row={mockRow}
        onClickDeleteButton={jest.fn()}
        {...props}
      />
    </BrowserRouter>
  </IntlProvider>,
);

describe('MemberActionCell', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders view button', () => {
    renderActionCell();
    expect(screen.getByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    renderActionCell();
    expect(screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage })).toBeInTheDocument();
  });

  it('view button has primary variant', () => {
    renderActionCell();
    const viewButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage });

    // Check that the button has the primary styling applied
    expect(viewButton).toHaveClass('btn-icon-primary');
  });

  it('delete button has danger variant', () => {
    renderActionCell();
    const deleteButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });

    // Check that the button has the danger styling applied
    expect(deleteButton).toHaveClass('btn-icon-danger');
  });

  it('calls navigate when view button is clicked', async () => {
    const user = userEvent.setup();
    renderActionCell();

    const viewButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage });
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

    const deleteButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });
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
    const viewButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage });
    const deleteButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });

    // Both buttons should have size="sm" applied (shows as btn-icon-sm for IconButton)
    expect(viewButton).toHaveClass('btn-icon-sm');
    expect(deleteButton).toHaveClass('btn-icon-sm');
  });

  it('handles multiple rapid delete clicks correctly', async () => {
    const user = userEvent.setup();
    const mockOnDelete = jest.fn();

    renderActionCell({ onClickDeleteButton: mockOnDelete });

    const deleteButton = screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });

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

    render(
      <IntlProvider locale="en">
        <BrowserRouter>
          <MemberActionCell
            row={{ id: '2', original: differentMember }}
            onClickDeleteButton={jest.fn()}
          />
        </BrowserRouter>
      </IntlProvider>,
    );

    expect(screen.getByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage })).toBeInTheDocument();
  });
});
