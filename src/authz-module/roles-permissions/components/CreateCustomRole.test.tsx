import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { authzCatalog, buildCatalogRole, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import CreateCustomRole from './CreateCustomRole';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

const catalogWithCustomRole = {
  ...authzCatalog,
  roles: [
    ...authzCatalog.roles,
    buildCatalogRole('technique_auditor', {
      displayName: 'Technique auditor',
      definitionKind: 'user_defined',
      permissions: ['courses.view_course'],
      scopeTypes: [SCOPE_TYPES.COURSE],
    }),
  ],
};

const openWizard = async () => {
  const user = userEvent.setup();
  renderWithAllProviders(<CreateCustomRole />);
  await user.click(screen.getByRole('button', { name: 'Create Custom Role' }));
  return user;
};

const getNextButton = () => screen.getByRole('button', { name: 'Next' });
// Next stays focusable while a required answer is missing, so it reports it instead of being disabled.
const expectNextBlocked = () => expect(getNextButton()).toHaveAttribute('aria-disabled', 'true');
const expectNextAllowed = () => expect(getNextButton()).toHaveAttribute('aria-disabled', 'false');

describe('CreateCustomRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog({ catalog: catalogWithCustomRole });
  });

  it('opens the wizard on the name and resource step', async () => {
    await openWizard();

    expect(screen.getByRole('dialog', { name: 'Create a new role' })).toBeInTheDocument();
    expect(screen.getByText('Name & Resource')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Role name' })).toHaveValue('');
    expect(screen.getByText('Shown when administrators assign access.')).toBeInTheDocument();
  });

  it('limits the role name to the 255 characters the backend accepts', async () => {
    const user = await openWizard();
    const name = screen.getByRole('textbox', { name: 'Role name' });
    expect(name).toHaveAttribute('maxLength', '255');
    await user.click(name);
    await user.paste('a'.repeat(300));
    expect(name).toHaveValue('a'.repeat(255));
  });
  it('starts from scratch on the first resource type', async () => {
    await openWizard();

    const startFrom = screen.getByRole('radiogroup', { name: 'Start from' });
    expect(within(startFrom).getByRole('radio', { name: /start from scratch/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(startFrom).getByRole('radio', { name: /clone from role/i })).toHaveAttribute('aria-checked', 'false');
    const resourceType = screen.getByRole('combobox', { name: 'Resource type' });
    expect(resourceType).toHaveValue(SCOPE_TYPES.COURSE);
    expect(within(resourceType).getAllByRole('option').map((option) => option.textContent)).toEqual(['Courses', 'Libraries']);
  });

  it('requires a role name before moving on', async () => {
    const user = await openWizard();
    expectNextBlocked();

    await user.type(screen.getByRole('textbox', { name: 'Role name' }), '   ');
    expectNextBlocked();

    await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
    expectNextAllowed();
  });

  it('moves on to the permissions step and back', async () => {
    const user = await openWizard();
    await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Resource type' }), 'Libraries');

    await user.click(getNextButton());
    expect(screen.queryByRole('textbox', { name: 'Role name' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('textbox', { name: 'Role name' })).toHaveValue('Course designer');
    expect(screen.getByRole('combobox', { name: 'Resource type' })).toHaveValue(SCOPE_TYPES.LIBRARY);
  });

  it('swaps the resource type for a grouped role picker when cloning', async () => {
    const user = await openWizard();

    await user.click(screen.getByRole('radio', { name: /clone from role/i }));

    expect(screen.queryByRole('combobox', { name: 'Resource type' })).not.toBeInTheDocument();
    const picker = screen.getByRole('button', { name: 'Role Select a role' });
    await user.click(picker);
    const standard = screen.getByRole('group', { name: 'Standard Roles' });
    expect(within(within(standard).getByRole('group', { name: 'Courses' })).getAllByRole('menuitemradio').map((item) => item.textContent))
      .toEqual(['Course Admin', 'Course Staff']);
    expect(within(within(standard).getByRole('group', { name: 'Libraries' })).getAllByRole('menuitemradio').map((item) => item.textContent))
      .toEqual(['Library Admin', 'Library Author', 'Library Contributor', 'Library User']);
    expect(within(screen.getByRole('group', { name: 'Custom Roles' })).getAllByRole('menuitemradio').map((item) => item.textContent))
      .toEqual(['Technique auditor']);
  });

  it('requires a source role when cloning, standard or custom', async () => {
    const user = await openWizard();
    await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
    await user.click(screen.getByRole('radio', { name: /clone from role/i }));
    expectNextBlocked();

    await user.click(screen.getByRole('button', { name: 'Role Select a role' }));
    await user.click(screen.getByText('Library Author'));
    expect(screen.getByRole('button', { name: 'Role Library Author' })).toBeInTheDocument();
    expectNextAllowed();

    await user.click(screen.getByRole('button', { name: 'Role Library Author' }));
    await user.click(screen.getByText('Technique auditor'));
    expect(screen.getByRole('button', { name: 'Role Technique auditor (Custom Role)' })).toBeInTheDocument();
    expectNextAllowed();
  });

  it('hides the custom roles group when there are none', async () => {
    mockAuthzCatalog();
    const user = await openWizard();
    await user.click(screen.getByRole('radio', { name: /clone from role/i }));

    await user.click(screen.getByRole('button', { name: 'Role Select a role' }));

    expect(screen.getByRole('group', { name: 'Standard Roles' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Custom Roles' })).not.toBeInTheDocument();
  });

  it('closes on Cancel and starts over when opened again', async () => {
    const user = await openWizard();
    await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog', { name: 'Create a new role' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create Custom Role' }));
    expect(screen.getByRole('textbox', { name: 'Role name' })).toHaveValue('');
  });

  it('shows a scope type it has no label for by its raw value, without an icon', async () => {
    const unknownScopeType = 'org-v1';
    mockAuthzCatalog({
      catalog: {
        ...authzCatalog,
        scopeTypes: [...authzCatalog.scopeTypes, unknownScopeType],
        roles: [...authzCatalog.roles, buildCatalogRole('org_admin', { displayName: 'Org Admin', scopeTypes: [unknownScopeType] })],
      },
    });
    const user = await openWizard();

    expect(within(screen.getByRole('combobox', { name: 'Resource type' })).getAllByRole('option').map((option) => option.textContent))
      .toEqual(['Courses', 'Libraries', unknownScopeType]);

    await user.click(screen.getByRole('radio', { name: /clone from role/i }));
    await user.click(screen.getByRole('button', { name: 'Role Select a role' }));
    expect(within(screen.getByRole('group', { name: unknownScopeType })).getAllByRole('menuitemradio').map((item) => item.textContent))
      .toEqual(['Org Admin']);
  });

  it('announces the roles loading, and offers neither field until they have', async () => {
    mockAuthzCatalog({ isLoading: true });
    const user = await openWizard();

    expect(screen.getByRole('status')).toHaveTextContent('Loading roles');
    expect(screen.queryByRole('combobox', { name: 'Resource type' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /clone from role/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Loading roles');
    expect(screen.queryByRole('button', { name: /^Role / })).not.toBeInTheDocument();
  });

  it('reports the roles failing to load', async () => {
    mockAuthzCatalog({ isError: true });
    await openWizard();

    expect(screen.getByText('The roles could not be loaded. Please try again later.')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Resource type' })).not.toBeInTheDocument();
    expectNextBlocked();
  });

  describe('accessibility', () => {
    it('names the content of each step by its position, and moves focus to it on Next and Back', async () => {
      const user = await openWizard();
      expect(screen.getByRole('group', { name: 'Step 1 of 2: Name & Resource' })).toBeInTheDocument();

      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      await user.click(getNextButton());
      expect(screen.getByRole('group', { name: 'Step 2 of 2: Permissions' })).toHaveFocus();

      await user.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('group', { name: 'Step 1 of 2: Name & Resource' })).toHaveFocus();
    });

    it('describes the fields by their helper text', async () => {
      await openWizard();

      expect(screen.getByRole('textbox', { name: 'Role name' }))
        .toHaveAccessibleDescription('Shown when administrators assign access.');
      expect(screen.getByRole('combobox', { name: 'Resource type' }))
        .toHaveAccessibleDescription(/Custom roles currently apply to a single resource type\./);
    });

    it('tells a screen reader why Next does nothing, and where to fix it', async () => {
      const user = await openWizard();
      expect(getNextButton()).toHaveAccessibleDescription('Enter a role name to continue.');

      await user.click(getNextButton());

      const name = screen.getByRole('textbox', { name: 'Role name' });
      expect(name).toHaveFocus();
      expect(name).toBeInvalid();
      expect(name).toHaveAccessibleDescription(/Enter a role name\./);
      expect(screen.getByRole('group', { name: 'Step 1 of 2: Name & Resource' })).toBeInTheDocument();
    });

    it('shows the name error once the field is left empty', async () => {
      const user = await openWizard();
      const name = screen.getByRole('textbox', { name: 'Role name' });
      expect(screen.queryByText('Enter a role name.')).not.toBeInTheDocument();

      await user.click(name);
      await user.tab();

      expect(screen.getByText('Enter a role name.')).toBeInTheDocument();
      expect(name).toBeInvalid();
    });

    it('asks for the role to clone, and focuses its picker', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      await user.click(screen.getByRole('radio', { name: /clone from role/i }));
      expect(getNextButton()).toHaveAccessibleDescription('Select a role to clone to continue.');

      await user.click(getNextButton());

      const picker = screen.getByRole('button', { name: 'Role Select a role' });
      expect(picker).toHaveFocus();
      expect(picker).toHaveAccessibleDescription('Select a role to clone.');
    });

    it.each([
      ['loading', { isLoading: true }, 'Roles are still loading. Wait to continue.'],
      ['failed to load', { isError: true }, 'Roles could not be loaded, so you cannot continue.'],
    ])('tells a screen reader why Next does nothing while the roles %s', async (_state, catalogState, hint) => {
      const user = userEvent.setup();
      mockAuthzCatalog(catalogState);
      renderWithAllProviders(<CreateCustomRole />);
      await user.click(screen.getByRole('button', { name: 'Create Custom Role' }));
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      expectNextBlocked();
      expect(getNextButton()).toHaveAccessibleDescription(hint);
    });
    it('moves between the start from cards with the arrow keys, as a radio group', async () => {
      const user = await openWizard();
      const scratch = screen.getByRole('radio', { name: /start from scratch/i });
      const clone = screen.getByRole('radio', { name: /clone from role/i });
      // One tab stop: the checked card.
      expect(scratch).toHaveAttribute('tabindex', '0');
      expect(clone).toHaveAttribute('tabindex', '-1');

      scratch.focus();
      await user.keyboard('{ArrowRight}');
      expect(clone).toHaveFocus();
      expect(clone).toHaveAttribute('aria-checked', 'true');
      expect(clone).toHaveAttribute('tabindex', '0');
      expect(scratch).toHaveAttribute('tabindex', '-1');

      await user.keyboard('{ArrowLeft}');
      expect(scratch).toHaveFocus();
      expect(scratch).toHaveAttribute('aria-checked', 'true');
    });

    it('leaves the start from choice alone on keys that are not arrows', async () => {
      const user = await openWizard();
      const scratch = screen.getByRole('radio', { name: /start from scratch/i });

      scratch.focus();
      await user.keyboard('{Home}{End}');

      expect(scratch).toHaveFocus();
      expect(scratch).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /clone from role/i })).toHaveAttribute('aria-checked', 'false');
    });

    it('lists the roles to clone as a menu, announces the selected one, and opens on the first', async () => {
      const user = await openWizard();
      await user.click(screen.getByRole('radio', { name: /clone from role/i }));
      const picker = screen.getByRole('button', { name: 'Role Select a role' });

      picker.focus();
      await user.keyboard('{Enter}');
      const items = screen.getAllByRole('menuitemradio');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(items[0]).toHaveFocus();
      expect(items.every((item) => item.getAttribute('aria-checked') === 'false')).toBe(true);

      await user.keyboard('{ArrowDown}{Enter}');
      expect(screen.getByRole('button', { name: 'Role Course Staff' })).toHaveFocus();

      await user.click(screen.getByRole('button', { name: 'Role Course Staff' }));
      expect(screen.getByRole('menuitemradio', { name: 'Course Staff' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('menuitemradio', { name: 'Course Admin' })).toHaveAttribute('aria-checked', 'false');
    });

    // Paragon's modal returns focus itself; this keeps a change of modal from losing it.
    it('hands focus back to the button that opened the wizard on Cancel and on Esc', async () => {
      const user = await openWizard();
      const openButton = screen.getByRole('button', { name: 'Create Custom Role', hidden: true });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(openButton).toHaveFocus();

      await user.click(openButton);
      expect(screen.getByRole('dialog', { name: 'Create a new role' })).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: 'Create a new role' })).not.toBeInTheDocument();
      expect(openButton).toHaveFocus();
    });
  });
});
