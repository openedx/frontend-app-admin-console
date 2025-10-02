import { Outlet } from 'react-router-dom';
import LibrariesTeamManager from './LibrariesTeamManager';
import LibrariesUserManager from './LibrariesUserManager';
import { LibraryAuthZProvider } from './context';

const LibrariesLayout = () => (<LibraryAuthZProvider><Outlet /></LibraryAuthZProvider>);

export {
  LibrariesLayout,
  LibrariesTeamManager,
  LibrariesUserManager,
};
