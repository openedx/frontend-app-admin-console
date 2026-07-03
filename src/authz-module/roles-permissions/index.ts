import { CONTENT_COURSE_PERMISSIONS } from './course/constants';
import { CONTENT_LIBRARY_PERMISSIONS } from './library/constants';

export {
  CONTENT_LIBRARY_PERMISSIONS,
  libraryResourceTypes,
  libraryPermissions,
  libraryRolesMetadata,
  rolesLibraryObject,
} from './library/constants';

export {
  CONTENT_COURSE_PERMISSIONS,
  courseResourceTypes,
  coursePermissions,
  rolesObject,
  courseRolesMetadata,
} from './course/constants';

export const MANAGE_TEAM_PERMISSIONS: { action: string }[] = [
  { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM },
  { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM },
];
