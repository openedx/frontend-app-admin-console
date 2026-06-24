import type { RoleMetadata } from '@src/types';
import { libraryRolesMetadata } from './library/constants';
import { courseRolesMetadata } from './course/constants';

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

export const allRolesMetadata: RoleMetadata[] = [...courseRolesMetadata, ...libraryRolesMetadata];
