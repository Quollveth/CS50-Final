import { SERVER_IP, Routes } from '../../constants';
import type { base64string } from './helpers';
import { throwServerError, AuthError, ServerError } from './errors';

export type UserData = {
  username: string;
  password: string | undefined; // String when sending it to the server, undefined when getting it back
  email?: string;
  picture?: string;
};

/**
 * Health check
 * @returns did server respond
 * @throws never
 */
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

/** 
 * Checks if a username already exists in the server
 * @returns boolean
 * @throws ServerError
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

/**
 * Register new user
 * @param user User data
 * @returns RegistResult
 * @throws server error
 */
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

/**
 * Login a user
 * @param user User data
 * @returns successfull login boolean
 * @throws server error
 */
export const loginUser = (user: UserData): Promise<boolean> => {
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
          // Expected error, invalid credentials
          resolve(xhr.responseJSON.result);
          return;
        }
        reject(err)
      },
    });
  });
};

/**
 * Logout user
 * @returns nothing
 * @throws auth error on unauthenticated user
 * @throws server error
 */
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

/**
 * Logout user
 * @returns UserData object of logged in user
 * @throws auth error on unauthenticated user
 * @throws server error
 */
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

/**
 * Updates data of logged in user
 * @param data New user data
 * @returns successfull update boolean
 * @throws auth error on unauthenticated user
 * @throws server error
 */
export const updateUserData = (
  data: {
    username:string,
    picture:base64string;
  }
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
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
};

/**
 * Validates password of logged in user
 * @returns match boolean
 * @throws auth error on unauthenticated user
 * @throws server error
 */
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

/**
 * Deletes profile of logged in user
 * @param password Password of user
 * @returns successfull deletion boolean
 * @throws auth error on unauthenticated user
 * @throws server error
 */
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