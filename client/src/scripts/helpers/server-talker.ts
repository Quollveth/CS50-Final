import { SERVER_IP, Routes } from '../../constants';
import type { base64string } from './helpers';
import { throwServerError, AuthError, ServerError } from './errors';

export type UserData = {
  username: string;
  password: string | undefined; // String when sending it to the server, undefined when getting it back
  email?: string;
  picture?: string;
};

// Health check
export const HealthCheck = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.healthCheck}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: () => resolve(true),
      error: () => resolve(false),
    });
  });
};

const RegisRes = {
  INVALID: 'INVALID', // Invalid data
  EXISTS: 'EXISTS', // User already exists
  SUCCESS: 'SUCCESS', // Success
} as const;
export type RegistResult = (typeof RegisRes)[keyof typeof RegisRes];

/** Checks if a username already exists in the server
 * @returns Promise resolving to wether or not the given username exists
 */
export const usernameExists = (username: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.post(`${SERVER_IP}${Routes.checkUser}`, {
      username: username,
    })
      .done((response) => {
        resolve(response.exists);
      })
      .fail(() => {
        reject(new ServerError('Request failed'));
      });
  });
};

// Register a new user
export const registerUser = (user: UserData): Promise<RegistResult> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.register}`,
      method: 'POST',
      data: user,
      success: (response) => resolve(response.result),
      error: (xhr, error) => {
        const err = throwServerError(xhr, [400]);
        if(err == null){
          // Expected error
          resolve(xhr.responseJSON.result);
          return;
        }
        reject(err);
      },
    });
  });
};

// Login a user
export const loginUser = (user: UserData): Promise<string> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.login}`,
      method: 'POST',
      data: user,
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => resolve(response.result),
      error: (xhr) => {
        const err = throwServerError(xhr, [400]);
        if(err == null){
          // Expected error
          resolve(xhr.responseJSON.result);
          return;
        }
        reject(err)
      },
    });
  });
};

// Logout a user
export const logoutUser = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.logout}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: () => resolve(),
      error: (xhr) => reject(throwServerError(xhr)),
    });
  });
};

// Get user data
export const getUserData = (): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.getUserData}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => {

        const data:UserData = {
          username: response.username,
          password: undefined, // The server doesn't store it in plain text or sends it back, don't worry, it's just here to keep typescript happy
          email: response.email,
          picture: `${SERVER_IP}${Routes.image}/${response.picture}`,
        }

        resolve(data);
      },
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    });
  });
};

// Update user data
export const updateUserData = (
  data: {
    username:string,
    picture:base64string;
  }
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    console.log('something is happening');
    $.ajax({
      url: `${SERVER_IP}${Routes.updateUserData}`,
      method: 'POST',
      data: data,
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: () => resolve(true),
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    });
  });
};

// Validate password
export const validatePassword = (password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.validatePassword}`,
      method: 'POST',
      data: { password },
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => resolve(true),
      error: (xhr) => {
        const err = throwServerError(xhr, [400]);
        if(err == null){
          // Expected error
          resolve(false);
          return;
        }
        reject(err);    
      },
    });
  });
}

// Delete user
export const deleteUser = (password:string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.deleteUser}`,
      method: 'POST',
      xhrFields: {
        withCredentials: true,
      },
      data: { password: password},
      crossDomain: true,
      success: () => resolve(true),
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    });
  });
}