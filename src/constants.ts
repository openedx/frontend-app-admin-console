export const appId = 'org.openedx.frontend.app.adminConsole';

export enum CustomErrors {
  NO_ACCESS = 'NO_ACCESS',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
}

type ErrorStatusCode = {
  [key in CustomErrors]: number[];
};

export const STATUS_400 = 400;
export const STATUS_404 = 404;

export const ERROR_STATUS: ErrorStatusCode = {
  [CustomErrors.NO_ACCESS]: [403, 401],
  [CustomErrors.NOT_FOUND]: [400, 404],
  [CustomErrors.SERVER_ERROR]: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511],
};
