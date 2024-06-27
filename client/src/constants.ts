export const SERVER_IP = 'https://127.0.0.1:5000';

export const Routes = {
  healthCheck: '/health', // Health check
  // CDN
  profile_picture: '/prof-pic',

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
  takeInOrder: '/take-in-order', // Take in an order
  getUserOrders: '/get-user-orders', // Get all orders of a specific user
  getOrderUsers: '/get-order-users', // Get all users of a specific order

  submitOrder: '/submit-order', // Submit an order
} as const;

export const maxImageSize = 5 * 1024 * 1024; // 5MB