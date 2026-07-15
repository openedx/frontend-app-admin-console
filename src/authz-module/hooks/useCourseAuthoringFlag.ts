import { useEffect, useMemo } from 'react';
import { useCourseAuthoringFlagStates } from '@src/authz-module/data/hooks';
import { useToastManager } from '@src/components/ToastManager/ToastManagerContext';

/**
 * Extract the org short name from a course external key.
 * e.g. `course-v1:testing+CT01+CT01-2024` -> `testing`
 */
const orgOf = (courseId: string): string | undefined => courseId.split(':')[1]?.split('+')[0];

// Several components on the same page consume this hook and share the underlying query,
// so they all observe the same error instance; track toasted errors to show one toast
// per failure instead of one per consumer.
const toastedErrors = new WeakSet<Error>();

/**
 * Resolve the course-authoring waffle flag state, both at the coarse domain level and
 * per individual course scope.
 *
 * `isCourseAuthoringEnabled` is the domain-level gate (enabled anywhere) used to decide
 * whether the authoring category should appear in controls like the roles filter.
 *
 * `isCourseEnabled(courseId)` resolves a single course against the overrides, applying
 * the precedence course override -> org override -> global. Overrides only appear when
 * they differ from `global`, so membership in the `on`/`off` lists is authoritative.
 *
 * `isOrgAuthoringEnabled(org)` resolves whether authoring is enabled for at least one
 * course within an org: the org override forces it on, some course in the org is forced
 * on, or (absent an off override) the global flag is on.
 *
 * While the flag states are loading, everything resolves to `false` so authoring scopes
 * and roles stay hidden until enablement is known. If the fetch fails, a generic error
 * toast (with retry) is surfaced and everything keeps resolving to `false`.
 */
export const useCourseAuthoringFlag = () => {
  const {
    data: flagStates, isLoading, error, refetch,
  } = useCourseAuthoringFlagStates();
  const { showErrorToast } = useToastManager();

  useEffect(() => {
    if (error && !toastedErrors.has(error)) {
      toastedErrors.add(error);
      showErrorToast(error, refetch);
    }
  }, [error, refetch, showErrorToast]);

  const isCourseAuthoringEnabled = flagStates
    ? flagStates.global
      || flagStates.orgOverrides.on.length > 0
      || flagStates.courseOverrides.on.length > 0
    : false;

  const { isCourseEnabled, isOrgAuthoringEnabled } = useMemo(() => {
    const courseOn = new Set(flagStates?.courseOverrides.on ?? []);
    const courseOff = new Set(flagStates?.courseOverrides.off ?? []);
    const orgOn = new Set(flagStates?.orgOverrides.on ?? []);
    const orgOff = new Set(flagStates?.orgOverrides.off ?? []);
    const global = flagStates?.global ?? false;

    const courseEnabled = (courseId: string): boolean => {
      if (courseOn.has(courseId)) { return true; }
      if (courseOff.has(courseId)) { return false; }
      const org = orgOf(courseId);
      if (org && orgOn.has(org)) { return true; }
      if (org && orgOff.has(org)) { return false; }
      return global;
    };

    const orgsWithForcedOnCourse = new Set([...courseOn].map(orgOf));

    const orgAuthoringEnabled = (org: string): boolean => {
      if (orgOn.has(org)) { return true; }
      if (orgsWithForcedOnCourse.has(org)) { return true; }
      if (orgOff.has(org)) { return false; }
      return global;
    };

    return { isCourseEnabled: courseEnabled, isOrgAuthoringEnabled: orgAuthoringEnabled };
  }, [flagStates]);

  return {
    isCourseAuthoringEnabled, isCourseEnabled, isOrgAuthoringEnabled, isLoading,
  };
};
