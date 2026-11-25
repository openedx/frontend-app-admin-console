import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/testUtils';
import { buildCatalogCategory, buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import { usePermissionSelection } from '../hooks/usePermissionSelection';
import PermissionsStep from './PermissionsStep';

const categories = [
  buildCatalogCategory('course', { displayName: 'Course' }),
  buildCatalogCategory('files', { displayName: 'Files' }),
];
const permissions = [
  buildCatalogPermission('view', { displayName: 'View course', description: 'See the course', categoryId: 'course' }),
  buildCatalogPermission('create', { displayName: 'Create course', description: 'Add a course', categoryId: 'course' }),
  buildCatalogPermission('edit', {
    displayName: 'Edit course', description: 'Change the outline', categoryId: 'course', implies: ['view'],
  }),
  buildCatalogPermission('upload', { displayName: 'Upload files', description: 'Add assets', categoryId: 'files' }),
  buildCatalogPermission('uncategorized', { displayName: 'Use the thing', description: 'No category' }),
];

const Host = ({ initial = [] }: { initial?: string[] }) => {
  const selection = usePermissionSelection({ scopeType: 'course-v1', permissions: initial }, null, permissions);
  return <PermissionsStep categories={categories} permissions={permissions} selection={selection} />;
};

const renderStep = (initial: string[] = []) => {
  const user = userEvent.setup();
  renderWrapper(<Host initial={initial} />);
  return user;
};
const getSwitch = (name: string) => screen.getByRole('switch', { name });
const getSummary = () => screen.getByRole('complementary');

describe('PermissionsStep', () => {
  it('lists the categories collapsed, with the uncategorized permissions under Other', () => {
    renderStep();
    ['Course', 'Files', 'Other'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'false');
    });
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByText('0 of 3 permissions selected')).toBeInTheDocument();
  });

  it('opens a category with Enter and Space, as a button does', async () => {
    const user = renderStep();
    const toggle = screen.getByRole('button', { name: 'Files' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(getSwitch('Upload files')).toBeInTheDocument();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('describes each switch by its description', async () => {
    const user = renderStep();
    await user.click(screen.getByRole('button', { name: 'Files' }));
    expect(getSwitch('Upload files')).toHaveAccessibleDescription('Add assets');
  });

  it('turns a permission on and off and keeps the summary in step', async () => {
    const user = renderStep();
    await user.click(screen.getByRole('button', { name: 'Files' }));
    await user.click(getSwitch('Upload files'));
    expect(getSwitch('Upload files')).toBeChecked();
    expect(within(getSummary()).getByText('1')).toBeInTheDocument();
    expect(within(getSummary()).getByText('1/1')).toBeInTheDocument();
    expect(within(getSummary()).getByText('permission selected across 1 area')).toBeInTheDocument();
    await user.click(getSwitch('Upload files'));
    expect(within(getSummary()).getByText('permissions selected across 0 areas')).toBeInTheDocument();
  });

  it('starts from the permissions it is given', () => {
    renderStep(['upload']);
    expect(screen.getByText('1 of 1 permissions selected')).toBeInTheDocument();
    expect(within(getSummary()).getByText('1/1')).toBeInTheDocument();
  });

  it('selects and deselects all the permissions of a category', async () => {
    const user = renderStep();
    await user.click(screen.getByRole('button', { name: 'Select all Course permissions' }));
    expect(screen.getByText('3 of 3 permissions selected')).toBeInTheDocument();
    expect(within(getSummary()).getByText('3/3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Deselect all Course permissions' }));
    expect(screen.getByText('0 of 3 permissions selected')).toBeInTheDocument();
  });

  it('enables and locks what a chosen permission needs, and names who needs it', async () => {
    const user = renderStep();
    await user.click(screen.getByRole('button', { name: 'Course' }));
    await user.click(getSwitch('Edit course'));
    expect(getSwitch('View course')).toBeChecked();
    expect(getSwitch('View course')).toBeDisabled();
    expect(getSwitch('View course')).toHaveAccessibleDescription(/Auto-enabled · Required by 'Edit course'/);
    expect(screen.getByText('2 of 3 permissions selected')).toBeInTheDocument();

    await user.click(getSwitch('Edit course'));
    expect(getSwitch('View course')).not.toBeChecked();
    expect(getSwitch('View course')).toBeEnabled();
  });

  it('expands and collapses every category at once', async () => {
    const user = renderStep();
    await user.click(screen.getByRole('button', { name: 'Expand all' }));
    expect(screen.getAllByRole('switch')).toHaveLength(5);
    await user.click(screen.getByRole('button', { name: 'Collapse all' }));
    await waitFor(() => expect(screen.queryByRole('switch')).not.toBeInTheDocument());
  });

  describe('search', () => {
    it('searches names and descriptions, opening the categories with a match and hiding the rest', async () => {
      const user = renderStep();
      await user.type(screen.getByPlaceholderText('Search'), 'outline');
      expect(getSwitch('Edit course')).toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: 'View course' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Files' })).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('1 permission shown');
    });

    it('keeps the summary on every category whatever is searched', async () => {
      const user = renderStep();
      await user.type(screen.getByPlaceholderText('Search'), 'outline');
      expect(within(getSummary()).getByText('Files')).toBeInTheDocument();
    });

    it('says when nothing matches', async () => {
      const user = renderStep();
      await user.type(screen.getByPlaceholderText('Search'), 'zzz');
      expect(screen.getByText('No permissions match your search.')).toBeInTheDocument();
    });
  });
});
