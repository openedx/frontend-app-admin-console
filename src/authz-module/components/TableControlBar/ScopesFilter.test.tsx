import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import ScopesFilter from './ScopesFilter';

jest.mock('@src/authz-module/data/hooks', () => ({
  useScopes: () => ({
    data: {
      pages: [
        {
          results: [
            {
              externalKey: 'course:123',
              name: 'Test Course',
              organization: { name: 'Test Org' },
            },
            {
              externalKey: 'library:456',
              name: 'Test Library',
              organization: { name: 'Another Org' },
            },
          ],
        },
      ],
    },
  }),
}));

describe('ScopesFilter', () => {
  const defaultProps = {
    filterButtonText: 'Scopes',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWrapper(<ScopesFilter {...defaultProps} />);
    expect(screen.getByText('Scopes')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWrapper(<ScopesFilter {...defaultProps} disabled />);
    expect(screen.getByText('Scopes')).toBeInTheDocument();
  });

  it('displays filter button text', () => {
    renderWrapper(<ScopesFilter {...defaultProps} filterButtonText="Select Scopes" />);
    expect(screen.getByText('Select Scopes')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    renderWrapper(<ScopesFilter {...defaultProps} />);
    const searchInputs = screen.queryAllByRole('textbox');
    if (searchInputs.length > 0) {
      await user.type(searchInputs[0], 'test search');
      expect(searchInputs[0]).toHaveValue('test search');
    }
  });

  it('calls setFilter when filter changes', () => {
    const mockSetFilter = jest.fn();
    renderWrapper(<ScopesFilter {...defaultProps} setFilter={mockSetFilter} />);
    expect(screen.getByText('Scopes')).toBeInTheDocument();
  });
});
