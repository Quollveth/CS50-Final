export const SERVER_IP = 'http://127.0.0.1:8080';
export const Routes = {
  login: '/login', // Login form
  register: '/register', // Registration form
  checkUser: '/check-user', // Check if username exists
} as const;

export const SESSION_COOKIE_NAME = 'Session';
