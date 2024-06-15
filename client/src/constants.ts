export const SERVER_IP = 'https://127.0.0.1:5000';

export const Routes = {
  healthCheck: '/health', // Health check
  image: '/image', // Image cdn

  /// User management
  login: '/login', // Login form
  register: '/register', // Registration form
  checkUser: '/check-user', // Check if username exists
  getUserData: '/get-udata', // Gets all saved user data
  logout: '/logout', // Logout
  updateUserData: '/update-udata', // Update user data
  validatePassword: '/validate-password', // Validate password
  deleteUser: '/delete-user', // Delete user
  getUserName: '/get-username', // Get username of user with specified id

  /// Order management
  placeOrder: '/place-order', // Place new order
  getAllOrders: '/get-all-orders', // Get all orders
  getOrderDetails: '/get-order', // Get details of a specific order
} as const;

export const maxImageSize = 5 * 1024 * 1024; // 5MB