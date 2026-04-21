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

    it('should handle all query parameters', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      getAuthenticatedHttpClient.mockReturnValue({
        get: mockGet,
      });

      const queryWithAllParams = {
        roles: 'admin,editor',
        search: 'test user',
        sortBy: 'username',
        order: 'desc' as const,
        scopes: null,
        organizations: null,
        pageSize: 20,
        pageIndex: 2,
      };

      await getTeamMembers('lib:123', queryWithAllParams);

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('roles=admin%2Ceditor');
      expect(calledUrl.toString()).toContain('search=test+user');
      expect(calledUrl.toString()).toContain('sort_by=username');
      expect(calledUrl.toString()).toContain('order=desc');
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

    it('should handle all query parameters including organizations', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      getAuthenticatedHttpClient.mockReturnValue({
        get: mockGet,
      });

      const queryWithAllParams = {
        roles: 'admin',
        organizations: 'edx,mit',
        search: 'library',
        sortBy: 'role',
        order: 'asc' as const,
        scopes: null,
        pageSize: 15,
        pageIndex: 1,
      };

      await getUserAssignedRoles('testuser', queryWithAllParams);

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('roles=admin');
      expect(calledUrl.toString()).toContain('orgs=edx%2Cmit');
      expect(calledUrl.toString()).toContain('search=library');
      expect(calledUrl.toString()).toContain('sort_by=role');
      expect(calledUrl.toString()).toContain('order=asc');
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

    it('should handle search, page, and pageSize parameters', async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      getAuthenticatedHttpClient.mockReturnValue({
        get: mockGet,
      });

      await getOrgs('test org', 2, 25);

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('search=test+org');
      expect(calledUrl.toString()).toContain('page=2');
      expect(calledUrl.toString()).toContain('page_size=25');
    });
  });

  describe('getScopes', () => {
    it('should fetch scopes successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            { displayName: 'Library 1', scope: 'lib:test1' },
          ],
          count: 1,
          next: null,
          previous: null,
        },
      };

      getAuthenticatedHttpClient.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getScopes({});

      expect(result.results).toHaveLength(1);
      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    });

    it('should handle search, page, and pageSize parameters', async () => {
      const mockResponse = {
        data: {
          results: [], count: 0, next: null, previous: null,
        },
      };
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      getAuthenticatedHttpClient.mockReturnValue({
        get: mockGet,
      });

      await getScopes({ search: 'library', page: 3, pageSize: 50 });

      expect(mockGet).toHaveBeenCalled();
      const calledUrl = mockGet.mock.calls[0][0];
      expect(calledUrl.toString()).toContain('search=library');
      expect(calledUrl.toString()).toContain('page=3');
      expect(calledUrl.toString()).toContain('page_size=50');
    });
  });
});
