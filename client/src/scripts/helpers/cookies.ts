// Default values are not assigned by functions, cookies lacking said attributes will be interpreted by browsers as having specified values
export interface Cookie {
  name: string; //Required
  value: string; //Required
  domain?: string; //Defaults to empty string
  path?: string; //Defaults to host url
  secure?: boolean; //Defaults to false
  HttpOnly?: boolean; //Defaults to false
  sameSite?: 'Strict' | 'Lax' | 'None'; //Defaults to Lax
  expires?: Date | null; //Defaults to expiring when session ends
}

export function setCookie(cookie: Cookie) {
  let cookieString =
    encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value);

  if (cookie.domain) {
    cookieString += '; domain=' + cookie.domain;
  }

  if (cookie.path) {
    cookieString += '; path=' + cookie.path;
  } else {
    cookieString += '; path=' + window.location.pathname;
  }

  if (cookie.expires) {
    cookieString += '; expires=' + cookie.expires.toUTCString();
  }

  if (cookie.secure) {
    cookieString += '; secure';
  }

  if (cookie.HttpOnly) {
    cookieString += '; HttpOnly';
  }

  if (cookie.sameSite) {
    cookieString += '; SameSite=' + cookie.sameSite;
  } else {
    cookieString += '; SameSite=Lax';
  }

  document.cookie = cookieString;
}

export function clearCookie(name: string) {
  document.cookie = name + '=; Max-Age=-1; path=/';
}

export function getCookie(name: string): Cookie | undefined {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (decodeURIComponent(cookieName) === name) {
      const cookieObj: Cookie = {
        name: decodeURIComponent(cookieName),
        value: decodeURIComponent(cookieValue)
      };
      return cookieObj;
    }
  }

  return undefined;
}
