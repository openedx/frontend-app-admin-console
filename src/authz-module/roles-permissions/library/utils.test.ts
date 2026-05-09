import type { IntlShape } from '@edx/frontend-platform/i18n';
import { buildPermissionMatrixByResource } from './utils';

const intl = { formatMessage: jest.fn((msg: any) => msg) } as unknown as IntlShape;

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
    name: 'admin', permissions: ['create_library', 'edit_library'], userCount: 2, role: 'admin', description: '', contextType: '', scope: '',
  },
  {
    name: 'editor', permissions: ['edit_library'], userCount: 2, role: 'editor', description: '', contextType: '', scope: '',
  },
  {
    name: 'guest', permissions: [], userCount: 2, role: 'guest', description: '', contextType: '', scope: '',
  },
];

describe('buildPermissionsMatrix', () => {
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
