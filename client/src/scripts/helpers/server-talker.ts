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

export const registerUser = (user: UserData): Promise<RegistResult> => {
  return new Promise((resolve, reject) => {
    $.post(`${SERVER_IP}${Routes.register}`, user)
      .done((response) => {
        if (response.valid) {
          resolve(response.valid);
        }
      })
      .fail((response) => {
        reject(new Error('Request failed'));
      });
  });
};
