import {
  getRolesMetadata,
  getPermissions,
  getResourceTypes,
  RESOURCE_TYPES,
  courseRolesMetadata,
} from './constants';

describe('getRolesMetadata', () => {
  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getRolesMetadata('unknown')).toEqual([]);
  });
});

describe('getPermissions', () => {
  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getPermissions('unknown')).toEqual([]);
  });
});

describe('getResourceTypes', () => {
  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getResourceTypes('unknown')).toEqual([]);
  });
});

describe('courseRolesMetadata', () => {
  it('course_editor and course_auditor are disabled', () => {
    const editor = courseRolesMetadata.find((r) => r.role === 'course_editor');
    const auditor = courseRolesMetadata.find((r) => r.role === 'course_auditor');
    expect(editor?.disabled).toBe(true);
    expect(auditor?.disabled).toBe(true);
  });

  it('course_admin and course_staff are not disabled', () => {
    const admin = courseRolesMetadata.find((r) => r.role === 'course_admin');
    const staff = courseRolesMetadata.find((r) => r.role === 'course_staff');
    expect(admin?.disabled).toBeUndefined();
    expect(staff?.disabled).toBeUndefined();
  });
});
