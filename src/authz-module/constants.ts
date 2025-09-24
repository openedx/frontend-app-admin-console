export interface TeamMember {
  displayName: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LibraryMetadata {
  id: string;
  org: string;
  title: string;
  slug: string;
}

export interface TableCellValue<T> {
  row: {
    original: T;
  };
}


export const ROUTES = {
  LIBRARIES_TEAM_PATH: '/libraries/:libraryId',
  LIBRARIES_USER_PATH: '/libraries/user/:username'
}; 
