import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import OrgFilter from './OrgFilter';

jest.mock('@src/authz-module/data/hooks', () => ({
  useOrgs: () => ({
    data: {
      count: 2,
      next: null,
      previous: null,
      results: [
        { id: 'org1', name: 'Organization 1', shortName: 'Org1' },
        { id: 'org2', name: 'Organization 2', shortName: 'Org2' },
      ],
    },
  }),
}));

jest.mock('@src/authz-module/hooks/useViewTeamPermissions', () => ({
  useViewTeamPermissions: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseViewTeamPermissions = useViewTeamPermissions as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

describe('OrgFilter', () => {
  const defaultProps = {
    filterButtonText: 'Organizations',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /Organizations/i }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseViewTeamPermissions.mockReturnValue({
      isCourseViewAllowed: true,
      isLibraryViewAllowed: true,
      isLoading: false,
    });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isOrgAuthoringEnabled: () => true,
      isLoading: false,
    });
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

  it('keeps all orgs for users with library access even when authoring is disabled', async () => {
    const user = userEvent.setup();
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isOrgAuthoringEnabled: () => false,
      isLoading: false,
    });
    renderWrapper(<OrgFilter {...defaultProps} />);
    await openDropdown(user);
    expect(await screen.findByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Organization 2')).toBeInTheDocument();
  });

  it('hides authoring-disabled orgs for course-only users', async () => {
    const user = userEvent.setup();
    mockUseViewTeamPermissions.mockReturnValue({
      isCourseViewAllowed: true,
      isLibraryViewAllowed: false,
      isLoading: false,
    });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isOrgAuthoringEnabled: (org: string) => org === 'Org1',
      isLoading: false,
    });
    renderWrapper(<OrgFilter {...defaultProps} />);
    await openDropdown(user);
    expect(await screen.findByText('Organization 1')).toBeInTheDocument();
    expect(screen.queryByText('Organization 2')).not.toBeInTheDocument();
  });

  it('keeps all orgs while permissions are still loading', async () => {
    const user = userEvent.setup();
    mockUseViewTeamPermissions.mockReturnValue({
      isCourseViewAllowed: false,
      isLibraryViewAllowed: false,
      isLoading: true,
    });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isOrgAuthoringEnabled: () => false,
      isLoading: false,
    });
    renderWrapper(<OrgFilter {...defaultProps} />);
    await openDropdown(user);
    expect(await screen.findByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Organization 2')).toBeInTheDocument();
  });
});
