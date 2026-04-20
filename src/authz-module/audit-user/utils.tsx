export const getPermissionsCountByRole = (/* role: string */) => {
/*
    const roleData = permissionsList.find(item => item.role === role);
    return roleData ? roleData.permissions.length : 0;
  */
  const count = Math.floor(Math.random() * 50);
  return count;
};
