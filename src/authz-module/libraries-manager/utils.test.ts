import { buildPermissionMatrix, buildPermissionsByRoleMatrix } from './utils';

const intl = { formatMessage: jest.fn((msg: any) => msg.defaultMessage) };
const permissions = [
  { key: 'create_library', resource: 'library', label: 'Create Library' },
  { key: 'edit_library', resource: 'library', label: 'Edit Library' },
];
const resources = [
  { key: 'library', label: 'Library', description: '' },
];

describe('buildPermissionsByRoleMatrix', () => {
  it('returns permissions matrix for given role', () => {
    const rolePermissions = ['create_library'];

    const matrix = buildPermissionsByRoleMatrix({
      rolePermissions, permissions, resources, intl,
    }) as Array<{ key: string; actions: Array<{ disabled: boolean }> }>;
    expect(matrix[0].key).toBe('library');
    expect(matrix[0].actions.length).toBe(2);
    expect(matrix[0].actions[0].disabled).toBe(false);
    expect(matrix[0].actions[1].disabled).toBe(true);
  });
});

describe('buildPermissionsByRoleMatrix', () => {
  it('should build permission matrix grouped by resources with role access mapped', () => {
    const roles = [
      {
        name: 'admin', permissions: ['create_library', 'edit_library'], userCount: 2, role: 'admin', description: '',
      },
      {
        name: 'editor', permissions: ['edit_library'], userCount: 2, role: 'editor', description: '',
      },
      {
        name: 'guest', permissions: [], userCount: 2, role: 'guest', description: '',
      },
    ];
    const matrix = buildPermissionMatrix(roles, permissions, resources, intl);

    expect(matrix).toEqual([
      {
        resource: 'library',
        resourceLabel: 'Library',
        permissions: [
          {
            key: 'create_library',
            actionKey: 'create',
            label: 'Create Library',
            roles: {
              admin: true,
              editor: false,
              guest: false,
            },
          },
          {
            key: 'edit_library',
            actionKey: 'edit',
            label: 'Edit Library',
            roles: {
              admin: true,
              editor: true,
              guest: false,
            },
          },
        ],
      },
    ]);
  });
});
