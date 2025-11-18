import {
  createContext, useContext, useMemo, ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { usePermissionsByRole } from '@src/authz-module/data/hooks';
import { PermissionMetadata, ResourceMetadata, Role } from 'types';
import { CustomErrors } from '@src/constants';
import {
  CONTENT_LIBRARY_PERMISSIONS, libraryPermissions, libraryResourceTypes, libraryRolesMetadata,
} from './constants';

const LIBRARY_TEAM_PERMISSIONS = [
  CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
  CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
];

export type AppContextType = {
  authenticatedUser: {
    username: string;
    email: string;
  };
};

type LibraryAuthZContextType = {
  canManageTeam: boolean;
  username: string;
  libraryId: string;
  resources: ResourceMetadata[];
  roles: Role[];
  permissions: PermissionMetadata[];
};

const LibraryAuthZContext = createContext<LibraryAuthZContextType | undefined>(undefined);

type AuthZProviderProps = {
  children: ReactNode;
};

export const LibraryAuthZProvider: React.FC<AuthZProviderProps> = ({ children }:AuthZProviderProps) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;

  // TODO: Implement a custom error view
  if (!libraryId) {
    throw new Error(CustomErrors.NOT_FOUND);
  }
  const permissions = LIBRARY_TEAM_PERMISSIONS.map(action => ({ action, scope: libraryId }));

  const { data: userPermissions } = useValidateUserPermissions(permissions);
  const [{ allowed: canViewTeam }, { allowed: canManageTeam }] = userPermissions;

  if (!canViewTeam && !canManageTeam) {
    throw new Error(CustomErrors.NO_ACCESS);
  }

  const { data: libraryRoles } = usePermissionsByRole(libraryId);
  const roles = libraryRoles.map(role => ({
    ...role,
    ...libraryRolesMetadata.find(r => r.role === role.role),
  } as Role));

  const value = useMemo((): LibraryAuthZContextType => ({
    username: authenticatedUser.username,
    libraryId,
    roles,
    permissions: libraryPermissions,
    resources: libraryResourceTypes,
    canManageTeam,
  }), [libraryId, authenticatedUser.username, canManageTeam, roles]);

  return (
    <LibraryAuthZContext.Provider value={value}>
      {children}
    </LibraryAuthZContext.Provider>
  );
};

export const useLibraryAuthZ = (): LibraryAuthZContextType => {
  const context = useContext(LibraryAuthZContext);
  if (context === undefined) {
    throw new Error('useLibraryAuthZ must be used within an LibraryAuthZProvider');
  }
  return context;
};
