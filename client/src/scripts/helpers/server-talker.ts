import { SERVER_IP, Routes } from '../../constants';
import type { base64string } from './helpers';
import { throwServerError, AuthError, ServerError } from './errors';
import type { Document } from './documents';
import type { Order } from './orders';

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

//// User Management

export type UserData = {
  username: string;
  password: string | undefined; // String when sending it to the server, undefined when getting it back
  email?: string;
  picture?: string;
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
export const loginUser = (user: UserData): Promise<{status: boolean;userId: number;}> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.login}`,
      method: 'POST',
      data: user,
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => resolve({
        status: response.result,
        userId: response.uid,
      }),
      error: (xhr) => {
        const err = throwServerError(xhr, [400]);
        if(err == null){
          // Expected error, invalid credentials
          resolve({status: false, userId: -1});
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
          picture: `${SERVER_IP}${Routes.profile_picture}/${response.picture}`,
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
export const updateUserData = (form:FormData): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.updateUserData}`,
      method: 'POST',
      data: form,
      contentType: false,
      processData: false,
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

const cachedNames: { [key: number]: string } = {};
export const getUserName = (id:number): Promise<string> => {
  if(cachedNames[id] != undefined){
    return new Promise((resolve) => {
      resolve(cachedNames[id]);
    });
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.getUserName}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      data: { id },
      crossDomain: true,
      success: (response) => resolve(response.username),
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    });
  });
}

//// Order Management

export const getUserOrders = (): Promise<Order[]> => {
  return new Promise((resolve) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.getUserOrders}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => {
        resolve(response);
      },
      error: (xhr) => {
        throwServerError(xhr);
      },
    })
  });
}

export const getUserPlacedOrders = (): Promise<Order[]> => {
  // TODO: Implement
  return new Promise((resolve) => {
    resolve([]);
  });
}

export const getAvailableOrders = (): Promise<Order[]> => {
  return new Promise((resolve,reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.getAllOrders}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (response) => {
        resolve(response);
      },
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    })
  });
}

export const placeNewOrder = (order: Order): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.placeOrder}`,
      method: 'POST',
      xhrFields: {
        withCredentials: true,
      },
      data: {order},
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

export const getOrderDetails = (id:number): Promise<Order> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.getOrderDetails}`,
      method: 'GET',
      xhrFields: {
        withCredentials: true,
      },
      data: { id },
      crossDomain: true,
      success: (response) => resolve(response),
      error: (xhr) => {
        reject(throwServerError(xhr))        
      },
    });
  });
}

export const takeInOrder = (oid:number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.takeInOrder}`,
      method: 'POST',
      xhrFields: {
        withCredentials: true,
      },
      data: { oid },
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
    })
  });
}

export const cancelOrder = (oid:number): Promise<boolean> => {
  return new Promise((resolve) => {
    //TODO: Implement cancel order
    resolve(false);
  })
}

export const submitOrder = (form:FormData): Promise<boolean> => {
  return new Promise((resolve) => {
    $.ajax({
      url: `${SERVER_IP}${Routes.submitOrder}`,
      method: 'POST',
      data: form,
      contentType: false,
      processData: false,
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
        throw err;
      },
    })
  });
}

//// Document Management

export const getUserDocuments = (): Promise<Document[]> => {
  // Placeholder
  return new Promise((resolve) => {
    resolve([]);
  });
}