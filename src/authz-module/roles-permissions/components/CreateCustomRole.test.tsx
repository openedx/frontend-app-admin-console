import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@openedx/frontend-base';
import { mockHttpClient, renderWithAllProviders } from '@src/testUtils';
import { authzCatalog, buildCatalogRole, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import CreateCustomRole from './CreateCustomRole';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedHttpClient: jest.fn(),
  logError: jest.fn(),
}));

// The catalog is served by `mockAuthzCatalog`; creating a role goes through the real mutation.
jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  ...jest.requireActual('@src/authz-module/catalog/data/hooks'),
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
  renderWithAllProviders(<ToastManagerProvider><CreateCustomRole /></ToastManagerProvider>);
  await user.click(screen.getByRole('button', { name: 'Create Custom Role' }));
  return user;
};

const getNextButton = () => screen.getByRole('button', { name: 'Next' });
// Next stays focusable while a required answer is missing, so it reports it instead of being disabled.
const expectNextBlocked = () => expect(getNextButton()).toHaveAttribute('aria-disabled', 'true');
const expectNextAllowed = () => expect(getNextButton()).toHaveAttribute('aria-disabled', 'false');

// How the platform HTTP client rejects: the status sits in `customAttributes`.
const buildHttpError = (status: number) => Object.assign(new Error(`Request failed with status ${status}`), {
  customAttributes: { httpErrorStatus: status },
});

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

  describe('permissions step', () => {
    const getSubmitButton = () => screen.getByRole('button', { name: 'Create' });
    const getTotal = () => within(screen.getByRole('complementary')).getByText(/^\d+$/);

    it('starts empty when built from scratch, with the create button off until a permission is chosen', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      await user.click(getNextButton());
      expect(screen.getByRole('heading', { name: 'Permissions matrix' })).toBeInTheDocument();
      expect(getTotal()).toHaveTextContent('0');
      expect(getSubmitButton()).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Select all Course permissions' }));
      expect(getTotal()).toHaveTextContent('3');
      expect(getSubmitButton()).toBeEnabled();
    });

    it('starts with the permissions of the role being cloned', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      await user.click(screen.getByRole('radio', { name: /clone from role/i }));
      await user.click(screen.getByRole('button', { name: 'Role Select a role' }));
      await user.click(screen.getByText('Course Staff'));
      await user.click(getNextButton());
      expect(getTotal()).toHaveTextContent('2');
      expect(within(screen.getByRole('complementary')).getByText('2/3')).toBeInTheDocument();
      expect(getSubmitButton()).toBeEnabled();
    });

    it('lists only the permissions of the chosen resource type', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Library designer');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Resource type' }), 'Libraries');
      await user.click(getNextButton());
      const summary = within(screen.getByRole('complementary'));
      expect(summary.getByText('Library')).toBeInTheDocument();
      expect(summary.queryByText('Course')).not.toBeInTheDocument();
    });

    it('keeps the choices when going back and forward, and when the name changes', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Course designer');
      await user.click(getNextButton());
      await user.click(screen.getByRole('button', { name: 'Select all Course permissions' }));

      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), ' v2');
      await user.click(getNextButton());
      expect(getTotal()).toHaveTextContent('3');
    });

    it('starts over when the resource type changes', async () => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), 'Designer');
      await user.click(getNextButton());
      await user.click(screen.getByRole('button', { name: 'Select all Course permissions' }));

      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.selectOptions(screen.getByRole('combobox', { name: 'Resource type' }), 'Libraries');
      await user.click(getNextButton());
      expect(getTotal()).toHaveTextContent('0');
    });
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

  describe('creating the role', () => {
    const getSubmitButton = () => screen.getByRole('button', { name: 'Create' });
    const getDialog = () => screen.queryByRole('dialog', { name: 'Create a new role' });

    /** Fills both steps: a course role named `name`, with every course permission. */
    const fillWizard = async (name = '  Course designer ') => {
      const user = await openWizard();
      await user.type(screen.getByRole('textbox', { name: 'Role name' }), name);
      await user.click(getNextButton());
      await user.click(screen.getByRole('button', { name: 'Select all Course permissions' }));
      return user;
    };

    const mockPost = (post: jest.Mock) => mockHttpClient().mockReturnValue({ post });

    it('sends the name, the resource type and the granted permissions, then closes with a success toast', async () => {
      const post = jest.fn().mockResolvedValue({
        data: { role: 'custom_course_designer', display_name: 'Course designer', scope_types: [SCOPE_TYPES.COURSE] },
      });
      mockPost(post);
      const user = await fillWizard();

      await user.click(getSubmitButton());

      expect(post).toHaveBeenCalledTimes(1);
      expect(post.mock.calls[0][1]).toEqual({
        display_name: 'Course designer',
        scope_types: [SCOPE_TYPES.COURSE],
        permissions: ['courses.edit_course_content', 'courses.manage_course_team', 'courses.view_course'],
      });
      expect(await screen.findByText('The Course designer role was created.')).toBeInTheDocument();
      expect(getDialog()).not.toBeInTheDocument();
    });

    it('shows the request as pending, and holds the wizard open until it settles', async () => {
      let resolvePost: (value: unknown) => void = () => {};
      mockPost(jest.fn(() => new Promise((resolve) => {
        resolvePost = resolve;
      })));
      const user = await fillWizard();

      await user.click(getSubmitButton());

      expect(screen.getByRole('button', { name: 'Creating' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
      await user.keyboard('{Escape}');
      expect(getDialog()).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(getDialog()).toBeInTheDocument();

      resolvePost({ data: { role: 'custom_course_designer', display_name: 'Course designer' } });
      await waitFor(() => expect(getDialog()).not.toBeInTheDocument());
    });

    it.each([
      [400, 'This role can not be created as it is. Check its name and permissions, then try again.'],
      [403, 'You do not have permission to create roles.'],
    ])('explains a %i on the permissions step, in our own words, and keeps the choices', async (status, message) => {
      mockPost(jest.fn().mockRejectedValue(buildHttpError(status)));
      const user = await fillWizard();

      await user.click(getSubmitButton());

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(message);
      expect(alert).toHaveFocus();
      expect(getDialog()).toBeInTheDocument();
      expect(getSubmitButton()).toBeEnabled();
      expect(within(screen.getByRole('complementary')).getByText(/^\d+$/)).toHaveTextContent('3');
    });

    it('closes the alert when it is dismissed', async () => {
      mockPost(jest.fn().mockRejectedValue(buildHttpError(400)));
      const user = await fillWizard();
      await user.click(getSubmitButton());

      await user.click(within(await screen.findByRole('alert')).getByRole('button', { name: 'Dismiss' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeEnabled();
    });

    it('reports a request that never reached the server with the generic error and a retry', async () => {
      mockPost(jest.fn().mockRejectedValue(new Error('Network Error')));
      const user = await fillWizard();

      await user.click(getSubmitButton());

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Something went wrong on our end.');
      expect(within(alert).getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('drops the alert on Back', async () => {
      mockPost(jest.fn().mockRejectedValue(buildHttpError(400)));
      const user = await fillWizard();
      await user.click(getSubmitButton());
      await screen.findByRole('alert');

      await user.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    describe('when the name is taken', () => {
      const getNameField = () => screen.getByRole('textbox', { name: 'Role name' });

      /** Fills the wizard and has the server reject its name. */
      const submitTakenName = async (post = jest.fn().mockRejectedValue(buildHttpError(409))) => {
        mockPost(post);
        const user = await fillWizard();
        await user.click(getSubmitButton());
        await screen.findByRole('alert');
        return user;
      };

      it('returns to the first step, with the name field in error and focused, and the alert', async () => {
        await submitTakenName();

        expect(getNameField()).toHaveValue('  Course designer ');
        expect(getNameField()).toBeInvalid();
        expect(getNameField()).toHaveFocus();
        expect(screen.getByText('A role with this name already exists.')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent(
          'A role named "Course designer" already exists. Please choose different name.',
        );
        expect(screen.getByTestId('step-error')).toBeInTheDocument();
      });

      it('blocks Next, and says why, while the name is unchanged', async () => {
        const user = await submitTakenName();

        expectNextBlocked();
        expect(getNextButton()).toHaveAccessibleDescription(
          'Another role already uses this name. Choose a different name to continue.',
        );
        await user.click(getNextButton());
        expect(screen.getByRole('textbox', { name: 'Role name' })).toHaveFocus();
      });

      it('clears the errors and the alert as soon as the name changes', async () => {
        const user = await submitTakenName();

        await user.type(getNameField(), 'x');

        expect(getNameField()).toBeValid();
        expect(screen.queryByText('A role with this name already exists.')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.queryByTestId('step-error')).not.toBeInTheDocument();
        expectNextAllowed();
      });

      it('marks the name again if it is typed back, whatever its case or spaces, without the alert', async () => {
        const user = await submitTakenName();

        await user.clear(getNameField());
        await user.type(getNameField(), 'COURSE DESIGNER  ');

        expect(getNameField()).toBeInvalid();
        expect(screen.getByText('A role with this name already exists.')).toBeInTheDocument();
        expectNextBlocked();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      it('keeps the chosen permissions, and creates the role under the new name', async () => {
        const post = jest.fn()
          .mockRejectedValueOnce(buildHttpError(409))
          .mockResolvedValueOnce({ data: { role: 'custom_course_editor', display_name: 'Course editor' } });
        const user = await submitTakenName(post);

        await user.clear(getNameField());
        await user.type(getNameField(), 'Course editor');
        await user.click(getNextButton());
        expect(within(screen.getByRole('complementary')).getByText(/^\d+$/)).toHaveTextContent('3');
        await user.click(getSubmitButton());

        expect(post.mock.calls[1][1]).toEqual({ ...post.mock.calls[0][1], display_name: 'Course editor' });
        expect(await screen.findByText('The Course editor role was created.')).toBeInTheDocument();
        expect(getDialog()).not.toBeInTheDocument();
      });
    });

    it('reports any other failure with a retry that sends the role again', async () => {
      const post = jest.fn()
        .mockRejectedValueOnce(buildHttpError(500))
        .mockResolvedValueOnce({ data: { role: 'custom_course_designer', display_name: 'Course designer' } });
      mockPost(post);
      const user = await fillWizard();

      await user.click(getSubmitButton());

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent("We're experiencing technical difficulties.");
      expect(alert).toHaveFocus();
      expect(logError).toHaveBeenCalled();

      await user.click(within(alert).getByRole('button', { name: 'Retry' }));

      expect(post).toHaveBeenCalledTimes(2);
      expect(await screen.findByText('The Course designer role was created.')).toBeInTheDocument();
      expect(getDialog()).not.toBeInTheDocument();
    });

    it('offers no retry for a rejected role, since sending it again changes nothing', async () => {
      mockPost(jest.fn().mockRejectedValue(buildHttpError(409)));
      const user = await fillWizard();

      await user.click(getSubmitButton());

      expect(within(await screen.findByRole('alert')).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
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
      renderWithAllProviders(<ToastManagerProvider><CreateCustomRole /></ToastManagerProvider>);
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
