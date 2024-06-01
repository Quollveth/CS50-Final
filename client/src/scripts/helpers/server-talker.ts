import { SERVER_IP, Routes } from '../../constants';
import type { base64string } from './helpers';

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
        //HANDLE: Improve error handling
        reject(new Error('Request failed'));
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
        //HANDLE: Improve error handling
        if (xhr.status == 400) {
          // Is it a expected error?
          if (xhr.responseJSON.result) {
            resolve(xhr.responseJSON.result);
          }
          throw new Error('Request Failed');
        }
        throw new Error('Request Failed');
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
        //HANDLE: Improve error handling
        if (xhr.status == 400) {
          // Is it a expected error?
          if (xhr.responseJSON.result) {
            resolve(xhr.responseJSON.result);
            return;
          }
          reject(new Error('Request Failed'));
        }
        reject(new Error('Request Failed'));
      },
    });
  });
};

// Logout a user
export const logoutUser = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.logout}`,
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
      //HANDLE: Improve error handling
      error: (xhr) => {
        if(xhr.status == 401){
          window.location.href = 'login.html';
          return;
        }
        reject(new Error('Request Failed'));
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
      error: (e) => reject(e),
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
      success: (response) => resolve(response.result),
      error: () => resolve(false),
    });
  });
}

// Delete user
export const deleteUser = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.deleteUser}`,
      method: 'DELETE',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: () => resolve(true),
      error: () => resolve(false),
    });
  });
}