import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildCatalogCategory, buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import { renderWrapper } from '@src/testUtils';
import CategoryTooltip from './CategoryTooltip';

const category = buildCatalogCategory('library', {
  displayName: 'Library', description: 'Permissions related to the library.',
});
const permissions = [buildCatalogPermission('content_libraries.view_library', {
  displayName: 'View', description: 'See the library.',
})];

const renderTooltip = () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  renderWrapper(<CategoryTooltip category={category} permissions={permissions} />);
  return { user, trigger: screen.getByRole('button', { name: 'About Library permissions' }) };
};
type TooltipContext = ReturnType<typeof renderTooltip>;
const expectVisibleTooltip = (tooltip: HTMLElement) => {
  expect(tooltip).toBeVisible();
  // Stylesheets are mocked, so also check that Bootstrap has not started fading it out.
  expect(tooltip).toHaveClass('show');
};

describe('CategoryTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('opens and describes the tooltip on keyboard focus, then closes on blur', async () => {
    const { user, trigger } = renderTooltip();

    await user.tab();

    expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole('tooltip');
    await waitFor(() => expectVisibleTooltip(tooltip));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-describedby', tooltip.id));

    await user.tab();

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it.each([
    {
      input: 'keyboard focus',
      open: ({ user }: TooltipContext) => user.tab(),
      reset: ({ user }: TooltipContext) => user.tab(),
    },
    {
      input: 'pointer hover',
      open: ({ user, trigger }: TooltipContext) => user.hover(trigger),
      reset: ({ user, trigger }: TooltipContext) => user.unhover(trigger),
    },
  ])(
    'dismisses a tooltip opened by $input on Escape without moving focus or immediately reopening',
    async ({ open, reset }) => {
      const context = renderTooltip();
      const { user } = context;
      await open(context);
      const tooltip = await screen.findByRole('tooltip');
      await waitFor(() => expectVisibleTooltip(tooltip));
      const focusedElement = document.activeElement;

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(document.activeElement).toBe(focusedElement);
      await act(async () => jest.advanceTimersByTime(1000));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      await reset(context);
      await open(context);
      await waitFor(() => expectVisibleTooltip(screen.getByRole('tooltip')));
    },
  );

  it('stays open while the pointer crosses into and hovers over the tooltip', async () => {
    const { user, trigger } = renderTooltip();
    await user.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    await waitFor(() => expectVisibleTooltip(tooltip));

    await user.unhover(trigger);
    await act(async () => jest.advanceTimersByTime(50));
    expectVisibleTooltip(tooltip);
    await user.hover(tooltip);
    await act(async () => jest.advanceTimersByTime(1000));
    expectVisibleTooltip(tooltip);

    await user.unhover(tooltip);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('stays open while the trigger has focus after the pointer leaves', async () => {
    const { user, trigger } = renderTooltip();
    await user.tab();
    await user.hover(trigger);

    await user.unhover(trigger);
    await act(async () => jest.advanceTimersByTime(1000));

    expectVisibleTooltip(screen.getByRole('tooltip'));
  });
});
