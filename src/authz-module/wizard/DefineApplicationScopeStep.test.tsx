import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import DefineApplicationScopeStep from './DefineApplicationScopeStep';
import { useScopes, useOrganizations, useManagedScopeOrgs } from '../data/hooks';

jest.mock('../data/hooks', () => ({
  useScopes: jest.fn(),
  useOrganizations: jest.fn(),
  useManagedScopeOrgs: jest.fn(),
}));

// IntersectionObserver is used for infinite scroll
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
beforeAll(() => {
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: jest.fn(),
  }));
});

const makeScopesHook = (overrides = {}) => ({
  data: {
    pages: [{
      results: [], count: 0, next: null, previous: null,
    }],
  },
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  isError: false,
  ...overrides,
});

const defaultOrgs = [
  { org: 'org1', name: 'Organization One' },
  { org: 'org2', name: 'Organization Two' },
];

const defaultManagedOrgs = new Set(['org1', 'org2']);

const defaultProps = {
  selectedRole: 'library_admin',
  selectedScopes: new Set<string>(),
  onScopeToggle: jest.fn(),
};

const renderComponent = (props = {}) => renderWrapper(
  <DefineApplicationScopeStep {...defaultProps} {...props} />,
);

describe('DefineApplicationScopeStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    (useScopes as jest.Mock).mockReturnValue(makeScopesHook());
    (useOrganizations as jest.Mock).mockReturnValue({ data: defaultOrgs });
    (useManagedScopeOrgs as jest.Mock).mockReturnValue({ data: defaultManagedOrgs });
  });

  describe('Title and layout', () => {
    it('renders the step title "Where It Applies"', () => {
      renderComponent();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Where It Applies');
    });

    it('renders the search input', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('renders count display', () => {
      renderComponent();
      expect(screen.getByText(/Showing 0 of 0/)).toBeInTheDocument();
    });
  });

  describe('Context type filter badge', () => {
    it('shows "Libraries" badge for a library role', () => {
      renderComponent({ selectedRole: 'library_admin' });
      expect(screen.getByText('Filter applied:')).toBeInTheDocument();
      expect(screen.getByText('Libraries')).toBeInTheDocument();
    });

    it('shows "Courses" badge for a course role', () => {
      renderComponent({ selectedRole: 'course_admin' });
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('does not show filter badge when selectedRole is null', () => {
      renderComponent({ selectedRole: null });
      expect(screen.queryByText('Filter applied:')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner when isLoading is true', () => {
      (useScopes as jest.Mock).mockReturnValue(makeScopesHook({ isLoading: true }));
      renderComponent();
      expect(screen.getByText('Loading scopes...')).toBeInTheDocument();
    });

    it('shows loading-more spinner when isFetchingNextPage is true', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({ isFetchingNextPage: true }),
      );
      renderComponent();
      expect(screen.getByText('Loading more...')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows "No scopes found." when there are no results', () => {
      renderComponent();
      expect(screen.getByText('No scopes found.')).toBeInTheDocument();
    });
  });

  describe('Scope list rendering', () => {
    const makeScope = (id: string, name: string, org: string) => ({
      id,
      name,
      org,
      contextType: 'library' as const,
    });

    it('renders platform-level scopes (no org) as standalone checkboxes', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:platform', 'Platform Library', '')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();
      expect(screen.getByLabelText('Platform Library')).toBeInTheDocument();
    });

    it('renders scopes grouped by org in OrgSection', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();
      expect(screen.getByText('Org: Organization One')).toBeInTheDocument();
      expect(screen.getByLabelText('Library One')).toBeInTheDocument();
    });

    it('checkbox is checked when scope is in selectedScopes', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent({ selectedScopes: new Set(['lib:org1/lib1']) });
      expect(screen.getByLabelText('Library One')).toBeChecked();
    });

    it('checkbox is unchecked when scope is not in selectedScopes', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent({ selectedScopes: new Set() });
      expect(screen.getByLabelText('Library One')).not.toBeChecked();
    });

    it('calls onScopeToggle with scope id when checkbox is clicked', async () => {
      const onScopeToggle = jest.fn();
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent({ onScopeToggle });
      const checkbox = screen.getByLabelText('Library One');
      await userEvent.click(checkbox);
      expect(onScopeToggle).toHaveBeenCalledWith('lib:org1/lib1');
    });

    it('shows scope description when present', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [{ ...makeScope('lib:org1/lib1', 'Library One', 'org1'), description: 'A test description' }],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();
      expect(screen.getByText('A test description')).toBeInTheDocument();
    });

    it('shows correct count "Showing X of Y"', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 5,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();
      expect(screen.getByText('Showing 1 of 5.')).toBeInTheDocument();
    });
  });

  describe('Aggregate scope items', () => {
    const makeScope = (id: string, name: string, org: string) => ({
      id, name, org, contextType: 'library' as const,
    });

    it('shows org aggregate option when org is in managedOrgs and contextType is set', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      // org1 is in managedOrgs (Set(['org1', 'org2']))
      renderComponent({ selectedRole: 'library_admin' });
      expect(screen.getByText('All libraries in this organization')).toBeInTheDocument();
    });

    it('does not show org aggregate when org is not in managedOrgs', () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org3/lib1', 'Library One', 'org3')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      (useManagedScopeOrgs as jest.Mock).mockReturnValue({ data: new Set(['org1']) });
      renderComponent({ selectedRole: 'library_admin' });
      expect(screen.queryByText('All libraries in this organization')).not.toBeInTheDocument();
    });

    it('shows platform aggregate when all orgs are managed', () => {
      (useScopes as jest.Mock).mockReturnValue(makeScopesHook());
      // All orgs in defaultOrgs (org1, org2) are in managedOrgs (org1, org2)
      (useManagedScopeOrgs as jest.Mock).mockReturnValue({ data: new Set(['org1', 'org2']) });
      renderComponent({ selectedRole: 'library_admin' });
      expect(screen.getByText('All libraries in Platform')).toBeInTheDocument();
    });

    it('does not show platform aggregate when some org is not managed', () => {
      (useManagedScopeOrgs as jest.Mock).mockReturnValue({ data: new Set(['org1']) });
      // org2 is not in managedOrgs so hasPlatformPermission is false
      renderComponent({ selectedRole: 'library_admin' });
      expect(screen.queryByText('All libraries in Platform')).not.toBeInTheDocument();
    });

    it('does not show platform aggregate when selectedRole is null', () => {
      renderComponent({ selectedRole: null });
      expect(screen.queryByText('All libraries in Platform')).not.toBeInTheDocument();
    });

    it('shows "All courses in Platform" for course context type', () => {
      (useManagedScopeOrgs as jest.Mock).mockReturnValue({ data: new Set(['org1', 'org2']) });
      renderComponent({ selectedRole: 'course_admin' });
      expect(screen.getByText('All courses in Platform')).toBeInTheDocument();
    });
  });

  describe('Organization dropdown', () => {
    it('renders organization dropdown button', () => {
      renderComponent();
      expect(screen.getByText('Organization')).toBeInTheDocument();
    });

    it('shows all organizations in dropdown', async () => {
      renderComponent();
      const toggle = screen.getByText('Organization');
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(screen.getByText('Organization One')).toBeInTheDocument();
        expect(screen.getByText('Organization Two')).toBeInTheDocument();
        expect(screen.getByText('All Organizations')).toBeInTheDocument();
      });
    });

    it('updates org filter when organization is selected', async () => {
      renderComponent();
      const toggle = screen.getByText('Organization');
      await userEvent.click(toggle);
      await waitFor(() => screen.getByText('Organization One'));
      await userEvent.click(screen.getByText('Organization One'));
      // After selecting org1, useScopes is called with org: 'org1'
      expect(useScopes).toHaveBeenLastCalledWith(expect.objectContaining({ org: 'org1' }));
    });

    it('clears org filter when "All Organizations" is selected', async () => {
      renderComponent();
      const toggle = screen.getByText('Organization');
      await userEvent.click(toggle);
      await waitFor(() => screen.getByText('All Organizations'));
      await userEvent.click(screen.getByText('All Organizations'));
      expect(useScopes).toHaveBeenLastCalledWith(expect.objectContaining({ org: undefined }));
    });
  });

  describe('Search input', () => {
    it('updates search state when typing', () => {
      renderComponent();
      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'mylib' } });
      expect(searchInput).toHaveValue('mylib');
    });
  });

  describe('OrgSection collapse/expand', () => {
    const makeScope = (id: string, name: string, org: string) => ({
      id, name, org, contextType: 'library' as const,
    });

    it('starts expanded and collapses when header clicked', async () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();

      // Initially visible
      expect(screen.getByLabelText('Library One')).toBeInTheDocument();

      // Click the org header button to collapse
      const orgHeader = screen.getByText('Org: Organization One').closest('button')!;
      await userEvent.click(orgHeader);

      // Now the scope should be hidden
      expect(screen.queryByLabelText('Library One')).not.toBeInTheDocument();
    });

    it('expands again after second click', async () => {
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({
          data: {
            pages: [{
              results: [makeScope('lib:org1/lib1', 'Library One', 'org1')],
              count: 1,
              next: null,
              previous: null,
            }],
          },
        }),
      );
      renderComponent();

      const orgHeader = screen.getByText('Org: Organization One').closest('button')!;
      await userEvent.click(orgHeader);
      await userEvent.click(orgHeader);

      expect(screen.getByLabelText('Library One')).toBeInTheDocument();
    });
  });

  describe('IntersectionObserver for infinite scroll', () => {
    it('sets up IntersectionObserver on the load-more div', () => {
      renderComponent();
      expect(window.IntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });

    it('calls fetchNextPage when intersection is triggered with hasNextPage=true', () => {
      const fetchNextPage = jest.fn();
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({ hasNextPage: true, fetchNextPage }),
      );

      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
      (window.IntersectionObserver as jest.Mock).mockImplementation((cb) => {
        intersectionCallback = cb;
        return { observe: mockObserve, disconnect: mockDisconnect, unobserve: jest.fn() };
      });

      renderComponent();

      // Simulate intersection
      intersectionCallback!([{ isIntersecting: true } as IntersectionObserverEntry]);
      expect(fetchNextPage).toHaveBeenCalled();
    });

    it('does not call fetchNextPage when hasNextPage is false', () => {
      const fetchNextPage = jest.fn();
      (useScopes as jest.Mock).mockReturnValue(
        makeScopesHook({ hasNextPage: false, fetchNextPage }),
      );

      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
      (window.IntersectionObserver as jest.Mock).mockImplementation((cb) => {
        intersectionCallback = cb;
        return { observe: mockObserve, disconnect: mockDisconnect, unobserve: jest.fn() };
      });

      renderComponent();

      intersectionCallback!([{ isIntersecting: true } as IntersectionObserverEntry]);
      expect(fetchNextPage).not.toHaveBeenCalled();
    });
  });
});
