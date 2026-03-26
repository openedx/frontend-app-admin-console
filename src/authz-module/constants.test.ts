import {
  getRolesMetadata,
  getPermissions,
  getResourceTypes,
  RESOURCE_TYPES,
  RoleOperationErrorStatus,
  ROUTES,
  libraryRolesMetadata,
  courseRolesMetadata,
  libraryPermissions,
  libraryResourceTypes,
  CONTENT_LIBRARY_PERMISSIONS,
  COURSE_PERMISSIONS,
} from './constants';

describe('ROUTES', () => {
  it('defines the expected paths', () => {
    expect(ROUTES.LIBRARIES_TEAM_PATH).toBe('/libraries/:libraryId');
    expect(ROUTES.LIBRARIES_USER_PATH).toBe('/libraries/:libraryId/:username');
    expect(ROUTES.ASSIGN_ROLE_WIZARD_PATH).toBe('/assign-role');
  });
});

describe('RoleOperationErrorStatus', () => {
  it('has expected enum values', () => {
    expect(RoleOperationErrorStatus.USER_NOT_FOUND).toBe('user_not_found');
    expect(RoleOperationErrorStatus.USER_ALREADY_HAS_ROLE).toBe('user_already_has_role');
    expect(RoleOperationErrorStatus.USER_DOES_NOT_HAVE_ROLE).toBe('user_does_not_have_role');
    expect(RoleOperationErrorStatus.ROLE_ASSIGNMENT_ERROR).toBe('role_assignment_error');
    expect(RoleOperationErrorStatus.ROLE_REMOVAL_ERROR).toBe('role_removal_error');
  });
});

describe('getRolesMetadata', () => {
  it('returns library roles for LIBRARY resource type', () => {
    expect(getRolesMetadata(RESOURCE_TYPES.LIBRARY)).toEqual(libraryRolesMetadata);
    expect(getRolesMetadata(RESOURCE_TYPES.LIBRARY)).toHaveLength(4);
  });

  it('returns course roles for COURSE resource type', () => {
    expect(getRolesMetadata(RESOURCE_TYPES.COURSE)).toEqual(courseRolesMetadata);
    expect(getRolesMetadata(RESOURCE_TYPES.COURSE)).toHaveLength(4);
  });

  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getRolesMetadata('unknown')).toEqual([]);
  });
});

describe('getPermissions', () => {
  it('returns library permissions for LIBRARY resource type', () => {
    expect(getPermissions(RESOURCE_TYPES.LIBRARY)).toEqual(libraryPermissions);
    expect(getPermissions(RESOURCE_TYPES.LIBRARY).length).toBeGreaterThan(0);
  });

  it('returns empty array for COURSE resource type', () => {
    expect(getPermissions(RESOURCE_TYPES.COURSE)).toEqual([]);
  });
});

describe('getResourceTypes', () => {
  it('returns library resource types for LIBRARY resource type', () => {
    expect(getResourceTypes(RESOURCE_TYPES.LIBRARY)).toEqual(libraryResourceTypes);
    expect(getResourceTypes(RESOURCE_TYPES.LIBRARY)).toHaveLength(4);
  });

  it('returns empty array for COURSE resource type', () => {
    expect(getResourceTypes(RESOURCE_TYPES.COURSE)).toEqual([]);
  });
});

describe('libraryRolesMetadata', () => {
  it('includes all expected library roles', () => {
    const roles = libraryRolesMetadata.map((r) => r.role);
    expect(roles).toContain('library_admin');
    expect(roles).toContain('library_author');
    expect(roles).toContain('library_contributor');
    expect(roles).toContain('library_user');
  });

  it('all library roles have contextType "library"', () => {
    libraryRolesMetadata.forEach((r) => {
      expect(r.contextType).toBe('library');
    });
  });
});

describe('courseRolesMetadata', () => {
  it('includes expected course roles', () => {
    const roles = courseRolesMetadata.map((r) => r.role);
    expect(roles).toContain('course_admin');
    expect(roles).toContain('course_staff');
    expect(roles).toContain('course_editor');
    expect(roles).toContain('course_auditor');
  });

  it('all course roles have contextType "course"', () => {
    courseRolesMetadata.forEach((r) => {
      expect(r.contextType).toBe('course');
    });
  });

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

describe('CONTENT_LIBRARY_PERMISSIONS', () => {
  it('defines all expected permission keys', () => {
    expect(CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY).toBe('content_libraries.delete_library');
    expect(CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TAGS).toBe('content_libraries.manage_library_tags');
    expect(CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY).toBe('content_libraries.view_library');
    expect(CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_CONTENT).toBe('content_libraries.edit_library_content');
    expect(CONTENT_LIBRARY_PERMISSIONS.PUBLISH_LIBRARY_CONTENT).toBe('content_libraries.publish_library_content');
    expect(CONTENT_LIBRARY_PERMISSIONS.REUSE_LIBRARY_CONTENT).toBe('content_libraries.reuse_library_content');
    expect(CONTENT_LIBRARY_PERMISSIONS.CREATE_LIBRARY_COLLECTION).toBe('content_libraries.create_library_collection');
    expect(CONTENT_LIBRARY_PERMISSIONS.EDIT_LIBRARY_COLLECTION).toBe('content_libraries.edit_library_collection');
    expect(CONTENT_LIBRARY_PERMISSIONS.DELETE_LIBRARY_COLLECTION).toBe('content_libraries.delete_library_collection');
    expect(CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM).toBe('content_libraries.manage_library_team');
    expect(CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM).toBe('content_libraries.view_library_team');
  });
});

describe('COURSE_PERMISSIONS', () => {
  it('defines view permissions', () => {
    expect(COURSE_PERMISSIONS.VIEW_COURSE).toBe('courses.view_course');
    expect(COURSE_PERMISSIONS.VIEW_COURSE_UPDATES).toBe('courses.view_course_updates');
    expect(COURSE_PERMISSIONS.VIEW_PAGES_AND_RESOURCES).toBe('courses.view_pages_and_resources');
    expect(COURSE_PERMISSIONS.VIEW_FILES).toBe('courses.view_files');
    expect(COURSE_PERMISSIONS.VIEW_GRADING_SETTINGS).toBe('courses.view_grading_settings');
    expect(COURSE_PERMISSIONS.VIEW_CHECKLISTS).toBe('courses.view_checklists');
    expect(COURSE_PERMISSIONS.VIEW_COURSE_TEAM).toBe('courses.view_course_team');
    expect(COURSE_PERMISSIONS.VIEW_SCHEDULE_AND_DETAILS).toBe('courses.view_schedule_and_details');
  });

  it('defines edit permissions', () => {
    expect(COURSE_PERMISSIONS.EDIT_COURSE_CONTENT).toBe('courses.edit_course_content');
    expect(COURSE_PERMISSIONS.MANAGE_LIBRARY_UPDATES).toBe('courses.manage_library_updates');
    expect(COURSE_PERMISSIONS.MANAGE_COURSE_UPDATES).toBe('courses.manage_course_updates');
    expect(COURSE_PERMISSIONS.MANAGE_PAGES_AND_RESOURCES).toBe('courses.manage_pages_and_resources');
    expect(COURSE_PERMISSIONS.CREATE_FILES).toBe('courses.create_files');
    expect(COURSE_PERMISSIONS.EDIT_FILES).toBe('courses.edit_files');
    expect(COURSE_PERMISSIONS.EDIT_GRADING_SETTINGS).toBe('courses.edit_grading_settings');
    expect(COURSE_PERMISSIONS.MANAGE_GROUP_CONFIGURATIONS).toBe('courses.manage_group_configurations');
    expect(COURSE_PERMISSIONS.EDIT_DETAILS).toBe('courses.edit_details');
    expect(COURSE_PERMISSIONS.MANAGE_TAGS).toBe('courses.manage_tags');
  });

  it('defines publish and lifecycle permissions', () => {
    expect(COURSE_PERMISSIONS.PUBLISH_COURSE_CONTENT).toBe('courses.publish_course_content');
    expect(COURSE_PERMISSIONS.DELETE_FILES).toBe('courses.delete_files');
    expect(COURSE_PERMISSIONS.EDIT_SCHEDULE).toBe('courses.edit_schedule');
    expect(COURSE_PERMISSIONS.MANAGE_ADVANCED_SETTINGS).toBe('courses.manage_advanced_settings');
    expect(COURSE_PERMISSIONS.MANAGE_CERTIFICATES).toBe('courses.manage_certificates');
    expect(COURSE_PERMISSIONS.IMPORT_COURSE).toBe('courses.import_course');
    expect(COURSE_PERMISSIONS.EXPORT_COURSE).toBe('courses.export_course');
    expect(COURSE_PERMISSIONS.EXPORT_TAGS).toBe('courses.export_tags');
  });

  it('defines team and taxonomy permissions', () => {
    expect(COURSE_PERMISSIONS.MANAGE_COURSE_TEAM).toBe('courses.manage_course_team');
    expect(COURSE_PERMISSIONS.MANAGE_TAXONOMIES).toBe('courses.manage_taxonomies');
  });

  it('defines legacy role permissions', () => {
    expect(COURSE_PERMISSIONS.LEGACY_STAFF_ROLE_PERMISSIONS).toBe('courses.legacy_staff_role_permissions');
    expect(COURSE_PERMISSIONS.LEGACY_INSTRUCTOR_ROLE_PERMISSIONS).toBe('courses.legacy_instructor_role_permissions');
    expect(COURSE_PERMISSIONS.LEGACY_LIMITED_STAFF_ROLE_PERMISSIONS).toBe('courses.legacy_limited_staff_role_permissions');
    expect(COURSE_PERMISSIONS.LEGACY_DATA_RESEARCHER_PERMISSIONS).toBe('courses.legacy_data_researcher_permissions');
    expect(COURSE_PERMISSIONS.LEGACY_BETA_TESTER_PERMISSIONS).toBe('courses.legacy_beta_tester_permissions');
  });
});

describe('getPermissions default case', () => {
  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getPermissions('unknown')).toEqual([]);
  });
});

describe('getResourceTypes default case', () => {
  it('returns empty array for unknown resource type', () => {
    // @ts-expect-error testing invalid input
    expect(getResourceTypes('unknown')).toEqual([]);
  });
});
