import { getSiteConfig } from '@openedx/frontend-base';

export const getApiUrl = (path: string) => `${getSiteConfig().lmsBaseUrl}${path || ''}`;
export const getStudioApiUrl = (path: string) => `${getSiteConfig().cmsBaseUrl}${path || ''}`;

/**
 * Safely reads the HTTP status that @edx/frontend-platform's HTTP client attaches
 * to thrown errors. Returns `undefined` when no status is present.
 */
export const getHttpErrorStatus = (error: unknown): number | undefined => (
  (error as PlatformError | null | undefined)?.customAttributes?.httpErrorStatus
);
