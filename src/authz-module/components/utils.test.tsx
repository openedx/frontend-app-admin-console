import React from 'react';
import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import { getCellHeader } from './utils';

const renderCellHeader = (columnId: string, columnTitle: string, filtersApplied: string[]) => {
  const component = getCellHeader(columnId, columnTitle, filtersApplied);
  return renderWrapper(<div>{component}</div>);
};

describe('getCellHeader', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      },
    });
  });

  it('displays column title without filter icon when no filters are applied', () => {
    const { container } = renderCellHeader('scope', 'Scope', []);

    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('displays column title without filter icon when column is not in filters applied', () => {
    const { container } = renderCellHeader('scope', 'Scope', ['role', 'organization']);

    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('displays column title with filter icon when column has filter applied', () => {
    const { container } = renderCellHeader('scope', 'Scope', ['scope', 'role']);

    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays filter icon only for matching column when multiple filters applied', () => {
    const { container } = renderCellHeader('organization', 'Organization', ['scope', 'organization', 'role']);

    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles empty column title', () => {
    const { container } = renderCellHeader('scope', '', ['scope']);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles special characters in column title', () => {
    const { container } = renderCellHeader('scope', 'Scope & Context', ['scope']);

    expect(screen.getByText('Scope & Context')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('is case sensitive when matching column ID', () => {
    const { container } = renderCellHeader('scope', 'Scope', ['SCOPE', 'Role']);

    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('handles long column titles with filters', () => {
    const { container } = renderCellHeader('organization', 'Very Long Organization Column Title', ['organization']);

    expect(screen.getByText('Very Long Organization Column Title')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays correct structure when filter is applied', () => {
    renderCellHeader('role', 'Role', ['role']);

    const container = screen.getByText('Role').closest('span');
    expect(container).toHaveClass('d-flex', 'flex-row', 'align-items-center');
  });
});
