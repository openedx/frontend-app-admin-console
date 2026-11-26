import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import DuplicateRoleButton from './DuplicateRoleButton';
import messages from './messages';

const renderButton = () => renderWrapper(<DuplicateRoleButton />);

describe('DuplicateRoleButton', () => {
  it('renders button with correct text', () => {
    renderButton();
    expect(screen.getByRole('button', { name: messages['authz.action.duplicate.role'].defaultMessage })).toBeInTheDocument();
  });

  it('renders with correct variant', () => {
    renderButton();
    const button = screen.getByRole('button', { name: messages['authz.action.duplicate.role'].defaultMessage });
    expect(button).toHaveClass('btn-outline-primary');
  });

  it('renders with small size', () => {
    renderButton();
    const button = screen.getByRole('button', { name: messages['authz.action.duplicate.role'].defaultMessage });
    expect(button).toHaveClass('btn-sm');
  });
});
