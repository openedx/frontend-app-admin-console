import { render, screen } from '@testing-library/react';
import { getPermissionsCountByRole, getCellHeader } from './utils';

describe('getPermissionsCountByRole', () => {
  it('returns a number', () => {
    const result = getPermissionsCountByRole();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('getCellHeader', () => {
  it('returns string title when column is not filtered', () => {
    const result = getCellHeader('role', 'Role', ['org']);
    expect(result).toBe('Role');
  });

  it('returns JSX with icon when column is filtered', () => {
    const result = getCellHeader('role', 'Role', ['role', 'org']);
    render(<div>{result}</div>);
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(document.querySelector('.pgn__icon')).toBeInTheDocument();
    expect(document.querySelector('.d-flex')).toBeInTheDocument();
    expect(document.querySelector('.mr-2')).toBeInTheDocument();
  });

  it('returns JSX with icon when only target column is filtered', () => {
    const result = getCellHeader('scope', 'Scope', ['scope']);
    render(<div>{result}</div>);
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(document.querySelector('.pgn__icon')).toBeInTheDocument();
  });

  it('returns string when filters array is empty', () => {
    const result = getCellHeader('role', 'Role', []);
    expect(result).toBe('Role');
  });
});
