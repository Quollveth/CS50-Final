import $ from 'jquery';
import { SERVER_IP, Routes } from '../../constants';

export const validateSession = (
  session: string
): Promise<{ valid: boolean; token: string }> => {
  return new Promise((resolve, reject) => {
    $.post(`${SERVER_IP}${Routes.validate}`, { token: session })
      .done((response) => {
        resolve(response);
      })
      .fail((response) => {
        //TODO: Improve error handling
        reject(new Error(`Request failed`));
      });
  });
};

export type UserData = {
  username: string;
  password: string;
  email?: string;
};

const RegisRes = {
  INVALID: 'INVALID', // Invalid data
  EXISTS: 'EXISTS', // User already exists
  SUCCESS: 'SUCCESS' // Success
} as const;
export type RegistResult = (typeof RegisRes)[keyof typeof RegisRes];

/** Checks if a username already exists in the server
 * @returns Promise resolving to wether or not the given username exists
 */
export const usernameExists = (username:string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.post(`${SERVER_IP}${Routes.checkUser}`, {
      username: username
    }).done((response) => {
      resolve(response.exists)
    })
    .fail((response) => {
      //TODO: Improve error handling
      reject(new Error('Request failed'));
    })
  })
}

export const registerUser = (user: UserData): Promise<RegistResult> => {
  return new Promise((resolve, reject) => {
    $.post(`${SERVER_IP}${Routes.register}`, user)
      .done((response) => {
        if (response.valid) {
          resolve(response.valid);
        }
      })
      .fail((response) => {
        //TODO: Improve error handling
        reject(new Error('Request failed'));
      });
  });
};
