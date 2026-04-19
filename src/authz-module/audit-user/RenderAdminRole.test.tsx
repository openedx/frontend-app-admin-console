import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import RenderAdminRole from './RenderAdminRole';

describe('RenderAdminRole', () => {
  const adminRole = 'course_admin';
  const superuserRole = 'django.superuser';
  const staffRole = 'django.globalstaff';
  const instructorRole = 'instructor';
  const emptyRole = '';

  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  it('renders without crashing', () => {
    const { container } = renderWrapper(<RenderAdminRole role={adminRole} />);
    expect(container.querySelector('.mb-4')).toBeInTheDocument();
  });

  it('displays admin message for roles containing admin', () => {
    renderWrapper(<RenderAdminRole role={adminRole} />);
    expect(screen.getByText(/super admins have full access/i)).toBeInTheDocument();
  });

  it('displays staff message for superuser role', () => {
    renderWrapper(<RenderAdminRole role={superuserRole} />);
    expect(screen.getByText(/global staff have access/i)).toBeInTheDocument();
  });

  it('displays staff message for roles not containing admin', () => {
    renderWrapper(<RenderAdminRole role={staffRole} />);
    expect(screen.getByText(/global staff have access/i)).toBeInTheDocument();
  });

  it('displays staff message for instructor role', () => {
    renderWrapper(<RenderAdminRole role={instructorRole} />);
    expect(screen.getByText(/global staff have access/i)).toBeInTheDocument();
  });

  it('handles undefined role gracefully', () => {
    renderWrapper(<RenderAdminRole role={undefined as any} />);
    expect(screen.getByText(/global staff have access/i)).toBeInTheDocument();
  });

  it('handles empty role string', () => {
    renderWrapper(<RenderAdminRole role={emptyRole} />);
    expect(screen.getByText(/global staff have access/i)).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    const { container } = renderWrapper(<RenderAdminRole role={adminRole} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('mb-0', 'text-primary-300', 'font-weight-light');
  });
});
