//// Miscellaneous

// Specifies the string is expected to be base64 encoded binary data
export type base64string = string;

// Capitalize first letter of each word
export const capitalize = (s: string): string =>
  s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const timeSince = (date: Date): string => {
  const now = Date.now();
  const past = date.getTime();
  const elapsed = now - past; // difference in milliseconds

  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days + (days === 1 ? ' day' : ' days');
  }
  if (hours > 0) {
    return hours + (hours === 1 ? ' hour' : ' hours');
  }
  if (minutes > 0) {
    return minutes + (minutes === 1 ? ' minute' : ' minutes');
  }
  return seconds + (seconds === 1 ? ' second' : ' seconds');
};


export const dateFormat = (date:string) => {
  // The date is in the format yyyy-mm-dd
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}


/* Notification handling
 * Notification is part of the template and thus available in all pages
 *
 */

export const notifColors = {
  ERROR: '#ff4d4d',
  SUCCESS: '#4dff4d',
  INFO: '#4d4dff',
  WARNING: '#ffcc00',
} as const;
export type Notification_Color = keyof typeof notifColors;

// Hide notification
export const hideNotification = (): void => {
  if (!notif_visible) {
    return;
  }

  notifBar.addClass('hidden');
  const notif_height = notifBar.css('height');
  $('#page').css('margin-top', 0);
  $('#topbar').css('margin-top', 0);
};

let notif_visible = false;
const notifBar = $('#global-notification');
let notifTimeoutId: NodeJS.Timeout | null = null;

/**
 * Creates a new notification with given text
 * @param text
 * @param color
 * @param timeout duration of notification in ms, defaults to 3000
 */
export const showNotification = (
  text: string,
  color: Notification_Color,
  timeout = 3000
): void => {
  // If not already visible, show notification
  if (!notif_visible) {
    notif_visible = true;
    notifBar.removeClass('hidden');
    const notif_height = notifBar.css('height');
    $('#page').css('margin-top', notif_height);
    $('#topbar').css('margin-top', notif_height);
  }

  // Set color and text
  notifBar.css('background-color', notifColors[color]);
  $('#global-notification-text').text(text);

  // Reset timeout and apply new timeout
  if (notifTimeoutId) {
    clearTimeout(notifTimeoutId);
  }

  notifTimeoutId = setTimeout(() => {
    hideNotification();
  }, timeout);
};

// Check if notification is visible
export const isNotificationVisible = (): boolean => notif_visible;

/**
 * Visual feedback for input fields
 * @param field field to validate
 * @param validationFn function to validate, must receive string and return boolean
 * @sideEffect input receives valid or invalid class
 */
export function validateField(
  field: JQuery<HTMLInputElement>,
  validationFn: (arg0: string) => boolean
) {
  field.on('input', () => {
    if (validationFn(field.val() as string)) {
      field.addClass('valid-input').removeClass('invalid-input');
    } else {
      field.addClass('invalid-input').removeClass('valid-input');
    }
  });
}

//// Validation functions

// Only alphanumerical characters
export const validateUsername = (str: string) => /^[a-zA-Z0-9]+$/.test(str);
// Simple email validator from https://regexr.com/3e48o
export const validateEmail = (str: string) =>
  /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str);
/*
 * At least 8 characters long
 * One uppercase letter
 * One lowercase letter
 * One digit
 */
export const validatePassword = (str: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(str);

//// File reading
/**
 * Read image file as base64 string
 * @param file provided by file input
 * @returns image data encoded in base64
 */
export const readImage = (file: File): Promise<base64string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target!.result as string;
      if (dataURL === null) {
        reject(new Error('Failed to read file'));
      }
      const base64String = dataURL.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsDataURL(file);
  });
};

//// Component handling

export const loadComponent = async (
  componentPath: string,
  parent: JQuery<HTMLElement>
): Promise<void> => {
  const currentURL = window.location.href;
  const directoryPath = currentURL.substring(0, currentURL.lastIndexOf('/'));
  $.get(`${directoryPath}/${componentPath}`).then((html) => {
    parent.html(html);
    $('#reset-button').trigger('click');
  });
};
