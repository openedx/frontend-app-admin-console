import { render, screen } from '@testing-library/react';
import DefineApplicationScopeStep from './DefineApplicationScopeStep';

describe('DefineApplicationScopeStep', () => {
  const defaultProps = {
    selectedRole: 'library_admin',
    selectedScopes: new Set(['lib:123']),
    onScopeToggle: jest.fn(),
  };

  it('renders the Step 2 placeholder heading', () => {
    render(<DefineApplicationScopeStep {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Step 2');
  });

  it('renders with null selectedRole', () => {
    render(
      <DefineApplicationScopeStep
        selectedRole={null}
        selectedScopes={new Set()}
        onScopeToggle={jest.fn()}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
