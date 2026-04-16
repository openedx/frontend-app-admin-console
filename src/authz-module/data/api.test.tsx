import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getTeamMembers,
  getUserAssignedRoles,
  assignTeamMembersRole,
  revokeUserRoles,
  getPermissionsByRole,
  getLibrary,
  getOrgs,
  getScopes,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockQuerySettings = {
  roles: null,
  scopes: null,
  organizations: null,
  search: null,
  order: null,
  sortBy: null,
  pageSize: 10,
  pageIndex: 0,
};

describe('API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeamMembers', () => {
    it('should fetch team members successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { username: 'user1', email: 'user1@example.com' },
          ],
          count: 1,
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getTeamMembers('lib:123', mockQuerySettings);

      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getUserAssignedRoles', () => {
    it('should fetch user assignments successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: '1', role: 'admin', scope: 'lib:test' },
          ],
          count: 1,
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getUserAssignedRoles('testuser', mockQuerySettings);

      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('assignTeamMembersRole', () => {
    it('should assign role successfully', async () => {
      const mockResponse = {
        data: {
          completed: [{ userIdentifier: 'user1', status: 'role_added' }],
          errors: [],
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
      });

      const requestData = {
        users: ['user1'],
        role: 'admin',
        scope: 'lib:123',
      };

      const result = await assignTeamMembersRole(requestData);

      expect(result.completed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('revokeUserRoles', () => {
    it('should revoke role successfully', async () => {
      const mockResponse = {
        data: {
          completed: [{ userIdentifiers: 'user1', status: 'role_removed' }],
          errors: [],
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        delete: jest.fn().mockResolvedValue(mockResponse),
      });

      const requestData = {
        users: 'user1',
        role: 'admin',
        scope: 'lib:123',
      };

      const result = await revokeUserRoles(requestData);

      expect(result.completed).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getPermissionsByRole', () => {
    it('should fetch permissions by role successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { role: 'admin', permissions: ['read', 'write'], userCount: 5 },
          ],
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getPermissionsByRole('lib:123');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getLibrary', () => {
    it('should fetch library successfully', async () => {
      const mockResponse = {
        data: {
          id: 'lib:123',
          org: 'test-org',
          title: 'Test Library',
          slug: 'test-library',
          allow_public_read: false,
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getLibrary('lib:123');

      expect(result.id).toBe('lib:123');
      expect(result.title).toBe('Test Library');
      expect(result.allowPublicRead).toBe(false);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getOrgs', () => {
    it('should fetch organizations successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { shortName: 'org1', name: 'Organization 1' },
          ],
          count: 1,
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getOrgs();

      expect(result.results).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });

  describe('getScopes', () => {
    it('should fetch scopes successfully', async () => {
      const mockResponse = {
        data: {
          scopes: [
            { displayName: 'Library 1', scope: 'lib:test1' },
          ],
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getScopes();

      expect(result.scopes).toHaveLength(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });
  });
});
