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
  error: null,
  refetch: jest.fn(),
  ...overrides,
});

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
      mockUseCourseAuthoringFlagStates.mockReturnValue(statesHook({ data: undefined, error }));

      const { result } = renderHook(() => useCourseAuthoringFlag(), { wrapper });

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong on our end.')).toBeInTheDocument();
      expect(logError).toHaveBeenCalledWith(error);
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
});
