import { getConfig } from '@edx/frontend-platform';

export const getApiUrl = (path: string) => `${getConfig().LMS_BASE_URL}${path || ''}`;
export const getStudioApiUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}${path || ''}`;

/**
 * Safely reads the HTTP status that @edx/frontend-platform's HTTP client attaches
 * to thrown errors. Returns `undefined` when no status is present.
 */
export const getHttpErrorStatus = (error: unknown): number | undefined => (
  (error as PlatformError | null | undefined)?.customAttributes?.httpErrorStatus
);
