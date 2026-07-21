import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useCourseAuthoringFlagStates } from '@src/authz-module/data/hooks';
import { useCourseAuthoringFlag } from './useCourseAuthoringFlag';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useCourseAuthoringFlagStates: jest.fn(),
}));

const mockUseCourseAuthoringFlagStates = useCourseAuthoringFlagStates as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">
    <ToastManagerProvider>{children}</ToastManagerProvider>
  </IntlProvider>
);

const flagStates = (overrides = {}) => ({
  global: false,
  orgOverrides: { on: [], off: [] },
  courseOverrides: { on: [], off: [] },
  ...overrides,
});

const statesHook = (overrides = {}) => ({
  data: flagStates(),
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  ...overrides,
});

// Cascade-test fixtures
const ORG = 'TestOrg';
const OTHER_ORG = 'OtherOrg';
const COURSE = `course-v1:${ORG}+C1+2024`;
const OTHER_COURSE = `course-v1:${ORG}+C2+2024`;
const OTHER_ORG_COURSE = `course-v1:${OTHER_ORG}+C1+2024`;

const setup = (
  global: boolean,
  orgOn: string[] = [],
  orgOff: string[] = [],
  courseOn: string[] = [],
  courseOff: string[] = [],
) => {
  mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({
    data: flagStates({
      global,
      orgOverrides: { on: orgOn, off: orgOff },
      courseOverrides: { on: courseOn, off: courseOff },
    }),
  }));
  return renderHook(() => useCourseAuthoringFlag(), { wrapper });
};

describe('useCourseAuthoringFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook());
  });

  describe('flag resolution', () => {
    it('enables the domain when the global flag is on', () => {
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: flagStates({ global: true }) }));
      const { result } = renderHook(() => useCourseAuthoringFlag(), { wrapper });
      expect(result.current.isCourseAuthoringEnabled).toBe(true);
      expect(result.current.isCourseEnabled('course-v1:org1+A+2024')).toBe(true);
      expect(result.current.isOrgAuthoringEnabled('org1')).toBe(true);
    });

    it('applies course override precedence over org override and global', () => {
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({
        data: flagStates({
          global: true,
          orgOverrides: { on: [], off: ['org1'] },
          courseOverrides: { on: ['course-v1:org1+A+2024'], off: [] },
        }),
      }));
      const { result } = renderHook(() => useCourseAuthoringFlag(), { wrapper });
      expect(result.current.isCourseEnabled('course-v1:org1+A+2024')).toBe(true);
      expect(result.current.isCourseEnabled('course-v1:org1+B+2024')).toBe(false);
      expect(result.current.isOrgAuthoringEnabled('org1')).toBe(true);
    });

    it('resolves everything to false while loading', () => {
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: undefined, isLoading: true }));
      const { result } = renderHook(() => useCourseAuthoringFlag(), { wrapper });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCourseAuthoringEnabled).toBe(false);
      expect(result.current.isCourseEnabled('course-v1:org1+A+2024')).toBe(false);
      expect(result.current.isOrgAuthoringEnabled('org1')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('shows no toast when the flag states load successfully', () => {
      renderHook(() => useCourseAuthoringFlag(), { wrapper });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('surfaces a generic error toast and keeps resolving to false when the fetch fails', async () => {
      const error = new Error('Request failed');
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: undefined, isError: true, error }));

      const { result } = renderHook(() => useCourseAuthoringFlag(), { wrapper });

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong on our end.')).toBeInTheDocument();
      expect(logError).toHaveBeenCalledWith(error);
      expect(result.current.isError).toBe(true);
      expect(result.current.isCourseAuthoringEnabled).toBe(false);
      expect(result.current.isCourseEnabled('course-v1:org1+A+2024')).toBe(false);
      expect(result.current.isOrgAuthoringEnabled('org1')).toBe(false);
    });

    it('retries the fetch from the toast action', async () => {
      const user = userEvent.setup();
      const error = new Error('Request failed');
      const refetch = jest.fn();
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: undefined, error, refetch }));

      renderHook(() => useCourseAuthoringFlag(), { wrapper });

      await user.click(await screen.findByRole('button', { name: 'Retry' }));
      expect(refetch).toHaveBeenCalled();
    });

    it('shows a single toast per failure when several components consume the hook', async () => {
      const error = new Error('Request failed');
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: undefined, error }));

      const Consumer = () => {
        useCourseAuthoringFlag();
        return null;
      };
      renderHook(() => useCourseAuthoringFlag(), {
        wrapper: ({ children }: { children: ReactNode }) => wrapper({
          children: (
            <>
              <Consumer />
              <Consumer />
              {children}
            </>
          ),
        }),
      });

      await waitFor(() => {
        expect(screen.getAllByRole('alert')).toHaveLength(1);
      });
    });
  });

  // Parametric truth-table tests for the cascade resolution logic.
  // Each test corresponds to one or more rows from the manual test table documented in
  // https://github.com/openedx/frontend-app-admin-console/pull/176#issuecomment-4995133343
  // Each test covers two manual rows at once — the "permission=No" and "permission=Yes"
  // variants of the same flag configuration — because the flag resolvers produce identical
  // output regardless of Casbin state. The "User Has Permission?" dimension is tested
  // separately via useViewTeamPermissions and the role/scope filter component tests.
  describe('cascade resolution — truth table', () => {
    // Mirrors the "Platform flag" section of the manual test table
    describe('platform flag only (no overrides)', () => {
      it('global off → authoring disabled for all courses and orgs', () => { // [Platform: off / no overrides]
        const { result } = setup(false);
        expect(result.current.isCourseAuthoringEnabled).toBe(false);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(false);
      });

      it('global on → authoring enabled for all courses and orgs', () => { // [Platform: on / no overrides]
        const { result } = setup(true);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
      });
    });

    // Mirrors the "ORG Override — Force On" rows of the manual test table
    describe('org Force On override', () => {
      it('global off + org Force On → overridden org enabled, other orgs remain off', () => { // [Org: platform off + org Force On]
        const { result } = setup(false, [ORG]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(false);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true);
        expect(result.current.isCourseEnabled(OTHER_ORG_COURSE)).toBe(false);
      });

      it('global on + org Force On → all orgs and courses enabled', () => { // [Org: platform on + org Force On]
        const { result } = setup(true, [ORG]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true);
        expect(result.current.isCourseEnabled(OTHER_ORG_COURSE)).toBe(true);
      });
    });

    // Mirrors the "ORG Override — Force Off" rows of the manual test table
    describe('org Force Off override', () => {
      it('global off + org Force Off → authoring disabled everywhere', () => { // [Org: platform off + org Force Off]
        const { result } = setup(false, [], [ORG]);
        expect(result.current.isCourseAuthoringEnabled).toBe(false);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(false);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false);
      });

      it('global on + org Force Off → overridden org disabled, other orgs remain on', () => { // [Org: platform on + org Force Off]
        const { result } = setup(true, [], [ORG]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(false);
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false);
        expect(result.current.isCourseEnabled(OTHER_ORG_COURSE)).toBe(true);
      });
    });

    // Mirrors the "Course Override — Force On" rows of the manual test table
    describe('course Force On override', () => {
      it('global off + course Force On → overridden course enabled, other courses in the org remain off', () => { // [Course: platform off + course Force On]
        const { result } = setup(false, [], [], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true);
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(false);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true); // has a forced-on course
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(false);
      });

      it('global on + course Force On → all courses enabled', () => { // [Course: platform on + course Force On]
        const { result } = setup(true, [], [], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true);
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
      });
    });

    // Mirrors the "Course Override — Force Off" rows of the manual test table
    describe('course Force Off override', () => {
      it('global off + course Force Off → authoring disabled everywhere', () => { // [Course: platform off + course Force Off]
        const { result } = setup(false, [], [], [], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(false);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false);
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(false);
      });

      it('global on + course Force Off → overridden course disabled, other courses remain on', () => { // [Course: platform on + course Force Off]
        const { result } = setup(true, [], [], [], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false);
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
      });
    });

    // Mirrors the "Override Priority (Cascade)" section of the manual test table
    describe('cascade priority — course override beats org override beats platform', () => {
      it('platform on + org Force Off + course Force On → course override wins, course enabled', () => { // [Cascade: platform on + org Force Off + course Force On → course wins]
        const { result } = setup(true, [], [ORG], [COURSE]);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true); // course override wins
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(false); // org off, no course override
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true); // has a forced-on course
      });

      it('platform on + org Force On + course Force Off → course override wins, course disabled', () => { // [Cascade: platform on + org Force On + course Force Off → course wins]
        const { result } = setup(true, [ORG], [], [], [COURSE]);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false); // course override wins
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(true); // inherits org on
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true); // org override on
      });

      it('platform off + org Force On + course Force Off → course override wins, course disabled', () => { // [Cascade: platform off + org Force On + course Force Off → course wins]
        const { result } = setup(false, [ORG], [], [], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true); // org override is on
        expect(result.current.isCourseEnabled(COURSE)).toBe(false); // course override wins
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(true); // inherits org on
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true); // org override on
      });

      it('platform off + org Force Off + course Force On → course override wins, course enabled', () => { // [Cascade: platform off + org Force Off + course Force On → course wins]
        const { result } = setup(false, [], [ORG], [COURSE]);
        expect(result.current.isCourseAuthoringEnabled).toBe(true); // course override is on
        expect(result.current.isCourseEnabled(COURSE)).toBe(true); // course override wins
        expect(result.current.isCourseEnabled(OTHER_COURSE)).toBe(false); // org off, no course override
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true); // has a forced-on course
      });

      it('platform off + org Force On → org override wins over platform, org courses enabled', () => { // [Cascade: platform off + org Force On → org wins over platform]
        const { result } = setup(false, [ORG]);
        expect(result.current.isCourseEnabled(COURSE)).toBe(true); // inherits org on
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(true);
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(false); // global off, no override
      });

      it('platform on + org Force Off → org override wins over platform, org courses disabled', () => { // [Cascade: platform on + org Force Off → org wins over platform]
        const { result } = setup(true, [], [ORG]);
        expect(result.current.isCourseEnabled(COURSE)).toBe(false); // inherits org off
        expect(result.current.isOrgAuthoringEnabled(ORG)).toBe(false);
        expect(result.current.isOrgAuthoringEnabled(OTHER_ORG)).toBe(true); // global on, no override
      });
    });
  });
});
