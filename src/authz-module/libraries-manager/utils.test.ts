import { buildPermissionsByRoleMatrix } from './utils';

describe('buildPermissionsByRoleMatrix', () => {
  it('returns permissions matrix for given role', () => {
    const rolePermissions = ['create_library'];
    const permissions = [
      { key: 'create_library', resource: 'library', label: 'Create Library' },
      { key: 'edit_library', resource: 'library', label: 'Edit Library' },
    ];
    const resources = [
      { key: 'library', label: 'Library', description: '' },
    ];

    const intl = { formatMessage: jest.fn((msg: any) => msg.defaultMessage) };
    const matrix = buildPermissionsByRoleMatrix({
      rolePermissions, permissions, resources, intl,
    }) as Array<{ key: string; actions: Array<{ disabled: boolean }> }>;
    expect(matrix[0].key).toBe('library');
    expect(matrix[0].actions.length).toBe(2);
    expect(matrix[0].actions[0].disabled).toBe(false);
    expect(matrix[0].actions[1].disabled).toBe(true);
  });
});
