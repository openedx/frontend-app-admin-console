import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import ConfirmDeletionModal from './ConfirmDeletionModal';

type Context = Parameters<typeof ConfirmDeletionModal>[0]['context'];

const renderModal = (context: Partial<Context>) => renderWrapper(
  <ConfirmDeletionModal
    isOpen
    close={jest.fn()}
    onSave={jest.fn()}
    context={{
      userName: 'jdoe',
      scope: 'lib:MathDept:ALG',
      scopeDisplayName: 'Algebra Library',
      org: 'MathDept',
      role: 'library_admin',
      name: 'Library Admin',
      rolesCount: 2,
      ...context,
    }}
  />,
);

describe('ConfirmDeletionModal', () => {
  it('names the course or library the role is removed from', () => {
    renderModal({});

    expect(screen.getByText(
      'Are you sure you want to remove the Library Admin role from the user “jdoe” in the scope Algebra Library?',
    )).toBeInTheDocument();
  });

  it('names the scope by its key when it has no display name', () => {
    renderModal({ scopeDisplayName: '' });

    expect(screen.getByText(/in the scope lib:MathDept:ALG\?/)).toBeInTheDocument();
  });

  it('says the role covers every library of the organization', () => {
    renderModal({ scope: 'lib:MathDept:*', scopeDisplayName: '' });

    expect(screen.getByText(
      'Are you sure you want to remove the Library Admin role from the user “jdoe” for all libraries in the organization MathDept?',
    )).toBeInTheDocument();
  });

  it('says the role covers every course of the platform', () => {
    renderModal({
      scope: 'course-v1:*', scopeDisplayName: '', org: '*', role: 'course_admin', name: 'Course Admin',
    });

    expect(screen.getByText(
      'Are you sure you want to remove the Course Admin role from the user “jdoe” for all courses on the platform?',
    )).toBeInTheDocument();
  });

  it('warns that removing the user only role revokes all their access', () => {
    renderModal({ scope: 'lib:*', org: '*', rolesCount: 1 });

    expect(screen.getByText(/This is the user's only role/)).toBeInTheDocument();
  });

  it('does not warn about losing all access when the user keeps other roles', () => {
    renderModal({ rolesCount: 2 });

    expect(screen.queryByText(/This is the user's only role/)).not.toBeInTheDocument();
  });
});
