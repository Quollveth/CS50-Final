import $ from 'jquery';
import { SERVER_IP, Routes } from '../../constants';

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
    .fail(() => {
      //HANDLE: Improve error handling
      reject(new Error('Request failed'));
    })
  })
}

export const registerUser = (user: UserData): Promise<RegistResult> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url:`${SERVER_IP}${Routes.register}`,
      method: 'POST',
      data: user,
      success: (response) => resolve(response.result),
      error: (xhr, error) => {
        //HANDLE: Improve error handling
        if(xhr.status == 400){
          // Is it a expected error?
          if(xhr.responseJSON.result){
            resolve(xhr.responseJSON.result)
          }
          throw new Error('Request Failed');
        }
        throw new Error('Request Failed');
      }
    })
  });
};

export const loginUser = (user:UserData): Promise<string> => {
  return new Promise((resolve) => {
    $.ajax({
      url:`${SERVER_IP}${Routes.login}`,
      method: 'POST',
      data: user,
      success: (response) => resolve(response),
      error: (xhr) => {
        //HANDLE: Improve error handling
        if(xhr.status == 400){
          // Is it a expected error?
          if(xhr.responseJSON.result){
            resolve(xhr.responseJSON.result)
          }
          throw new Error('Request Failed');
        }
        throw new Error('Request Failed');
      }
    })
  });
}