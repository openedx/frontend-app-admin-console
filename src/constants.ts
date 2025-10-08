export const appId = 'org.openedx.frontend.app.adminConsole';

export enum CUSTOM_ERRORS {
  NO_ACCESS = 'NO_ACCESS',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
};

type ERROR_STATUS = {
  [key in CUSTOM_ERRORS]: number[];
};

export const ERROR_STATUS: ERROR_STATUS = {
  [CUSTOM_ERRORS.NO_ACCESS]: [403, 401],
  [CUSTOM_ERRORS.NOT_FOUND]: [404],
  [CUSTOM_ERRORS.SERVER_ERROR]: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511],
};