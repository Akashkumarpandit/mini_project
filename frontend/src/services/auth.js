export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getToken();

export const saveAuth = (jwtResponse) => {
  localStorage.setItem('token', jwtResponse.token);
  
  const primaryRole = jwtResponse.role || (jwtResponse.roles && jwtResponse.roles.length > 0
    ? jwtResponse.roles[0].replace('ROLE_', '')
    : 'TENANT');

  localStorage.setItem('user', JSON.stringify({
    id:       jwtResponse.id,
    username: jwtResponse.username,
    name:     jwtResponse.name || jwtResponse.username,
    email:    jwtResponse.email,
    role:     primaryRole,
    roles:    jwtResponse.roles || [primaryRole],
    verified: !!jwtResponse.verified,
  }));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const hasRole = (role) => {
  const user = getUser();
  if (!user) return false;
  if (user.role === role) return true;
  return user.roles?.some(r => r === role || r === `ROLE_${role}`);
};

export const isAdmin = () => hasRole('ADMIN');
export const isOwner = () => hasRole('OWNER') || hasRole('ADMIN');
export const isAgent = () => hasRole('AGENT') || hasRole('ADMIN');
export const isTenant = () => hasRole('TENANT');
