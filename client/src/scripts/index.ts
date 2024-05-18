import $ from 'jquery';

import { SESSION_COOKIE_NAME } from '../constants';
import { getCookie, clearCookie } from './helpers/cookies';
import { validateSession } from './helpers/server-talker';

async function checkSession(token: string): Promise<string | undefined> {
  try {
    const result = await validateSession(token);
    if (result.valid) {
      return result.token; // return session token if valid
    } else {
      return undefined; // return undefined if valid is false
    }
  } catch (error) {
    throw error;
  }
}

$(function () {
  //Check if session cookie exists
  let session_cookie = getCookie(SESSION_COOKIE_NAME);
  if (!session_cookie) {
    //No cookie, go to login page
    window.location.href = 'login.html';
    return;
  }

  session_cookie = {
    name: SESSION_COOKIE_NAME,
    value: 'testValue'
  };

  //Cookie is present, validade with server
  checkSession(session_cookie.value).then((result) => {
    if (!result) {
      //invalid, go login again
      clearCookie(SESSION_COOKIE_NAME);
      window.location.href = 'login.html';
    }
    //valid, go to website

    //Website doesn't exist :(
    alert('Session validated');
  });
});
