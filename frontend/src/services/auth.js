export const getToken = ()         => localStorage.getItem('token');
export const getUser  = ()         => JSON.parse(localStorage.getItem('user') || 'null');
export const isLoggedIn = ()       => !!getToken();

export const saveAuth = (jwtResponse) => {
  localStorage.setItem('token', jwtResponse.token);
  localStorage.setItem('user', JSON.stringify({
    id:       jwtResponse.id,
    username: jwtResponse.username,
    email:    jwtResponse.email,
    roles:    jwtResponse.roles,
  }));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
