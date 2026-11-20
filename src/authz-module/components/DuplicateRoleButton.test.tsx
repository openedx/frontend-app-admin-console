import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';
import DuplicateRoleButton from './DuplicateRoleButton';
import messages from '../messages';

const renderButton = () => render(
  <IntlProvider locale="en">
    <DuplicateRoleButton />
  </IntlProvider>,
);

describe('DuplicateRoleButton', () => {
  it('renders button with correct text', () => {
    renderButton();
    expect(screen.getByRole('button', { name: messages['authz.custom.role.duplicate.role'].defaultMessage })).toBeInTheDocument();
  });

  it('renders with correct variant', () => {
    renderButton();
    const button = screen.getByRole('button', { name: messages['authz.custom.role.duplicate.role'].defaultMessage });
    expect(button).toHaveClass('btn-outline-primary');
  });

  it('renders with small size', () => {
    renderButton();
    const button = screen.getByRole('button', { name: messages['authz.custom.role.duplicate.role'].defaultMessage });
    expect(button).toHaveClass('btn-sm');
  });
});
