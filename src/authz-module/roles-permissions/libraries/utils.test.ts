import { buildPermissionMatrixByResource, buildPermissionMatrixByRole } from './utils';

const intl = { formatMessage: jest.fn((msg: any) => msg) };

const permissions = [
  {
    key: 'create_library', resource: 'library', label: 'Create Library', description: '',
  },
  {
    key: 'edit_library', resource: 'library', label: 'Edit Library', description: '',
  },
];
const resources = [
  { key: 'library', label: 'Library', description: '' },
];
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

describe('buildPermissionsMatrix', () => {
  it('returns permissions a matrix of given roles', () => {
    const matrix = buildPermissionMatrixByRole({
      roles, permissions, resources, intl,
    });
    expect(matrix.length).toBe(3);
    expect(matrix[1]).toEqual({
      name: 'editor',
      userCount: 2,
      role: 'editor',
      description: '',
      permissions: ['edit_library'],
      resources: [
        {
          key: 'library',
          label: 'Library',
          description: '',
          permissions: [
            {
              actionKey: 'create',
              description: '',
              disabled: true,
              key: 'create_library',
              label: 'Create Library',
              resource: 'library',
            },
            {
              key: 'edit_library',
              resource: 'library',
              label: 'Edit Library',
              description: '',
              actionKey: 'edit',
              disabled: false,
            },
          ],
        },
      ],
    });
  });

  it('should build permission matrix grouped by resources with role access mapped', () => {
    const matrix = buildPermissionMatrixByResource({
      roles, permissions, resources, intl,
    });

    expect(matrix).toEqual([
      {
        key: 'library',
        label: 'Library',
        description: '',
        permissions: [
          {
            key: 'create_library',
            actionKey: 'create',
            label: 'Create Library',
            resource: 'library',
            description: '',
            roles: {
              admin: true,
              editor: false,
              guest: false,
            },
          },
          {
            key: 'edit_library',
            actionKey: 'edit',
            resource: 'library',
            label: 'Edit Library',
            description: '',
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
