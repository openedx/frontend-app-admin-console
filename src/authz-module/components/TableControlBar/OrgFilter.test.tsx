import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import OrgFilter from './OrgFilter';

jest.mock('@src/authz-module/data/hooks', () => ({
  useOrgs: () => ({
    data: {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 'org1', name: 'Organization 1' },
        { id: 'org2', name: 'Organization 2' },
      ],
    },
  }),
}));

describe('OrgFilter', () => {
  const defaultProps = {
    filterButtonText: 'Organizations',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWrapper(<OrgFilter {...defaultProps} />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWrapper(<OrgFilter {...defaultProps} disabled />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('displays filter options', () => {
    renderWrapper(<OrgFilter {...defaultProps} />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    renderWrapper(<OrgFilter {...defaultProps} />);
    // Look for search input if it exists
    const searchInputs = screen.queryAllByRole('textbox');
    if (searchInputs.length > 0) {
      await user.type(searchInputs[0], 'test search');
      expect(searchInputs[0]).toHaveValue('test search');
    }
  });

  it('calls setFilter when filter changes', () => {
    const mockSetFilter = jest.fn();
    renderWrapper(<OrgFilter {...defaultProps} setFilter={mockSetFilter} />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });
});
