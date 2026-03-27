import {
  CONTENT_LIBRARY_PERMISSIONS,
  libraryRolesMetadata,
  libraryResourceTypes,
  libraryPermissions,
} from '../constants';

export {
  CONTENT_LIBRARY_PERMISSIONS,
  libraryRolesMetadata,
  libraryResourceTypes,
  libraryPermissions,
};

export const DEFAULT_TOAST_DELAY = 5000;
export const RETRY_TOAST_DELAY = 120_000; // 2 minutes
export const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));
