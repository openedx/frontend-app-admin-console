import { authzCatalog, buildCatalogRole } from '@src/authz-module/catalog/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import {
  EMPTY_CUSTOM_ROLE_DRAFT, START_FROM, buildCreateCustomRoleRequest, getCustomRoleSeed, isSameRoleName,
} from './customRoleDraft';

const roles = [
  ...authzCatalog.roles,
  buildCatalogRole('technique_auditor', {
    definitionKind: 'user_defined', permissions: ['courses.view_course'], scopeTypes: [SCOPE_TYPES.COURSE],
  }),
];
const getRole = (roleId: string) => roles.find(({ role }) => role === roleId);

describe('getCustomRoleSeed', () => {
  it('requires a name that is not only whitespace', () => {
    expect(getCustomRoleSeed({ ...EMPTY_CUSTOM_ROLE_DRAFT, name: '  ', scopeType: SCOPE_TYPES.COURSE }, getRole)).toBeNull();
  });

  it('starts a role from scratch with no permissions in the picked resource type', () => {
    expect(getCustomRoleSeed({ ...EMPTY_CUSTOM_ROLE_DRAFT, name: 'Designer', scopeType: SCOPE_TYPES.LIBRARY }, getRole))
      .toEqual({ scopeType: SCOPE_TYPES.LIBRARY, permissions: [] });
  });

  it('requires a resource type from scratch', () => {
    expect(getCustomRoleSeed({ ...EMPTY_CUSTOM_ROLE_DRAFT, name: 'Designer' }, getRole)).toBeNull();
  });

  it('requires a source role when cloning', () => {
    expect(getCustomRoleSeed({
      ...EMPTY_CUSTOM_ROLE_DRAFT, name: 'Designer', startFrom: START_FROM.CLONE, scopeType: SCOPE_TYPES.COURSE,
    }, getRole)).toBeNull();
  });

  it.each([
    ['a standard role', 'library_author', SCOPE_TYPES.LIBRARY, ['content_libraries.edit_library_content', 'content_libraries.view_library']],
    ['a custom role', 'technique_auditor', SCOPE_TYPES.COURSE, ['courses.view_course']],
  ])('copies the resource type and permissions of %s when cloning', (_, sourceRole, scopeType, permissions) => {
    // The scratch resource type is ignored: a clone keeps the source role's.
    expect(getCustomRoleSeed({
      name: 'Designer', startFrom: START_FROM.CLONE, scopeType: SCOPE_TYPES.COURSE === scopeType ? SCOPE_TYPES.LIBRARY : SCOPE_TYPES.COURSE, sourceRole,
    }, getRole)).toEqual({ scopeType, permissions });
  });

  it('does not share the source role permissions array', () => {
    const seed = getCustomRoleSeed({
      name: 'Designer', startFrom: START_FROM.CLONE, scopeType: '', sourceRole: 'course_admin',
    }, getRole);
    expect(seed?.permissions).not.toBe(getRole('course_admin')?.permissions);
  });
});

describe('buildCreateCustomRoleRequest', () => {
  const coursePermissions = authzCatalog.permissions.filter(({ scopeTypes }) => scopeTypes.includes(SCOPE_TYPES.COURSE));
  const seed = { scopeType: SCOPE_TYPES.COURSE, permissions: [] };

  it('sends the trimmed name and the resource type of the seed', () => {
    const draft = { ...EMPTY_CUSTOM_ROLE_DRAFT, name: '  Course designer  ', scopeType: SCOPE_TYPES.LIBRARY };
    expect(buildCreateCustomRoleRequest(draft, seed, new Set(['courses.view_course']), coursePermissions)).toEqual({
      displayName: 'Course designer',
      scopeType: SCOPE_TYPES.COURSE,
      permissions: ['courses.view_course'],
    });
  });

  it('sends the granted permissions of the resource type in catalog order, and nothing else', () => {
    const effective = new Set(['courses.view_course', 'content_libraries.view_library', 'courses.edit_course_content']);
    const request = buildCreateCustomRoleRequest(
      { ...EMPTY_CUSTOM_ROLE_DRAFT, name: 'Designer' },
      seed,
      effective,
      coursePermissions,
    );
    expect(request.permissions).toEqual(['courses.edit_course_content', 'courses.view_course']);
  });
});

describe('isSameRoleName', () => {
  it('ignores case and surrounding spaces, as the server does', () => {
    expect(isSameRoleName('  Course Designer ', 'course designer')).toBe(true);
  });

  it('tells apart names that differ in their characters, inner spaces included', () => {
    expect(isSameRoleName('Course designer', 'Course designers')).toBe(false);
    expect(isSameRoleName('Course designer', 'Course  designer')).toBe(false);
  });
});
