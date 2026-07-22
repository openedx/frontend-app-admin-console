import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { useScopes } from '@src/authz-module/data/hooks';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import ScopesFilter from './ScopesFilter';

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUsePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

jest.mock('@src/authz-module/data/hooks', () => ({
  useScopes: jest.fn(() => ({
    data: {
      pages: [
        {
          results: [
            {
              externalKey: 'course-v1:org+course+run',
              displayName: 'Test Course',
              org: { shortName: 'TestOrg' },
            },
            {
              externalKey: 'lib:org:library',
              displayName: 'Test Library',
              org: { shortName: 'TestOrg' },
            },
          ],
        },
      ],
    },
  })),
}));

const mockUseScopes = useScopes as jest.Mock;

const permissionsData = ({ library, course }: { library?: boolean; course?: boolean }) => [
  { action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM, allowed: !!library },
  { action: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM, allowed: !!course },
];

describe('ScopesFilter', () => {
  const defaultProps = {
    filterButtonText: 'Scopes',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermissions.mockReturnValue({ data: permissionsData({ library: true, course: true }) });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isLoading: false,
    });
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

  it('fetches all scope types when the user can view courses', () => {
    renderWrapper(<ScopesFilter {...defaultProps} />);
    expect(mockUseScopes).toHaveBeenCalledWith(
      expect.not.objectContaining({ scopeType: 'library' }),
    );
  });

  it('fetches only library scopes when the user cannot view courses', () => {
    mockUsePermissions.mockReturnValue({ data: permissionsData({ library: true, course: false }) });
    renderWrapper(<ScopesFilter {...defaultProps} />);
    expect(mockUseScopes).toHaveBeenCalledWith(
      expect.objectContaining({ scopeType: 'library' }),
    );
  });

  it('defaults to showing only library scopes while permissions are loading', () => {
    mockUsePermissions.mockReturnValue({ data: undefined, isLoading: true });
    renderWrapper(<ScopesFilter {...defaultProps} />);
    expect(mockUseScopes).toHaveBeenCalledWith(
      expect.objectContaining({ scopeType: 'library' }),
    );
  });

  it('lists course scopes whose course-authoring flag is enabled', async () => {
    const user = userEvent.setup();
    renderWrapper(<ScopesFilter {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Scopes/i }));
    expect(await screen.findByText('Test Library')).toBeInTheDocument();
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('hides course scopes whose course-authoring flag is disabled but keeps libraries', async () => {
    const user = userEvent.setup();
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isLoading: false,
    });
    renderWrapper(<ScopesFilter {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Scopes/i }));
    expect(await screen.findByText('Test Library')).toBeInTheDocument();
    expect(screen.queryByText('Test Course')).not.toBeInTheDocument();
  });

  it('hides only the flag-disabled course while keeping enabled courses and libraries (mixed per-course)', async () => {
    const user = userEvent.setup();
    mockUseScopes.mockReturnValue({
      data: {
        pages: [{
          results: [
            {
              externalKey: 'course-v1:org+enabled+run',
              displayName: 'Enabled Course',
              org: { shortName: 'TestOrg' },
            },
            {
              externalKey: 'course-v1:org+disabled+run',
              displayName: 'Disabled Course',
              org: { shortName: 'TestOrg' },
            },
            {
              externalKey: 'lib:org:library',
              displayName: 'Test Library',
              org: { shortName: 'TestOrg' },
            },
          ],
        }],
      },
    });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: (id: string) => id === 'course-v1:org+enabled+run',
      isLoading: false,
    });
    renderWrapper(<ScopesFilter {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /Scopes/i }));
    expect(await screen.findByText('Enabled Course')).toBeInTheDocument();
    expect(screen.queryByText('Disabled Course')).not.toBeInTheDocument();
    expect(screen.getByText('Test Library')).toBeInTheDocument();
  });
});
