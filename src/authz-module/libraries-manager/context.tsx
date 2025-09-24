import {
  createContext, useContext, useMemo, ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { useValidateUserPermissions } from '@src/helpers/useValidateUserPermissions';
import { useLibrary } from './data/hooks';

const LIBRARY_TEAM_PERMISSIONS = ['act:view_library_team', 'act:manage_library_team'];

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
  roles: string[];
  permissions: string[];
  libraryName: string;
  libraryOrg: string;
};

const LibraryAuthZContext = createContext<LibraryAuthZContextType | undefined>(undefined);

type AuthZProviderProps = {
  children: ReactNode;
};

export const LibraryAuthZProvider: React.FC<AuthZProviderProps> = ({ children }) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;

  // TODO: Implement a custom error view
  if (!libraryId) {
    throw new Error('MissingLibrary');
  }
  const permissions = LIBRARY_TEAM_PERMISSIONS.map(action => ({ action, object: libraryId }));

  const { data: userPermissions } = useValidateUserPermissions(permissions);
  const [{ allowed: canViewTeam }, { allowed: canManageTeam }] = userPermissions;

  if (!canViewTeam && !canManageTeam) {
    throw new Error('NoAccess');
  }

  const { data: libraryMetadata } = useLibrary(libraryId);

  const value = useMemo((): LibraryAuthZContextType => ({
    username: authenticatedUser.username,
    libraryId,
    libraryName: libraryMetadata.title,
    libraryOrg: libraryMetadata.org,
    roles: [],
    permissions: [],
    canManageTeam,
  }), [libraryId, authenticatedUser.username, canManageTeam]);

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
