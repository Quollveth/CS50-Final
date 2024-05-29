export const SERVER_IP = 'http://127.0.0.1:8080';
export const Routes = {
  login: '/login', // Login form
  register: '/register', // Registration form
  checkUser: '/check-user', // Check if username exists
  getUserData: '/get-udata', // Gets all saved user data
  healthCheck: '/', // Health check
} as const;