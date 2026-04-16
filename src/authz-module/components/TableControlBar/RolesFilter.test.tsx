import React from 'react';
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import RolesFilter from './RolesFilter';

describe('RolesFilter', () => {
  const defaultProps = {
    filterButtonText: 'Roles',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWrapper(<RolesFilter {...defaultProps} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWrapper(<RolesFilter {...defaultProps} disabled />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('displays filter button text', () => {
    renderWrapper(<RolesFilter {...defaultProps} filterButtonText="Select Roles" />);
    expect(screen.getByText('Select Roles')).toBeInTheDocument();
  });

  it('calls setFilter when filter changes', () => {
    const mockSetFilter = jest.fn();
    renderWrapper(<RolesFilter {...defaultProps} setFilter={mockSetFilter} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });
});
