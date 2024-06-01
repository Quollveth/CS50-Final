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

let notif_visible = false;
const notifBar = $('#global-notification');
export const showNotification = (
  text: string,
  color: Notification_Color
): void => {
  if (!notif_visible) {
    notif_visible = true;
    notifBar.removeClass('hidden');
    const notif_height = notifBar.css('height');
    $('#page').css('margin-top', notif_height);
    $('#topbar').css('margin-top', notif_height);
  }
  notifBar.css('background-color', notifColors[color]);
  $('#global-notification-text').text(text);
};

export const hideNotification = (): void => {
  if (!notif_visible) {
    return;
  }

  notifBar.addClass('hidden');
  const notif_height = notifBar.css('height');
  $('#page').css('margin-top', 0);
  $('#topbar').css('margin-top', 0);
};

export const isNotificationVisible = (): boolean => notif_visible;

export const capitalize = (s: string): string =>
  s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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





export const loadModal = async (
  modal: string,
  parent: JQuery<HTMLElement>
): Promise<void> => {
  const currentURL = window.location.href;
  const directoryPath = currentURL.substring(0, currentURL.lastIndexOf('/'));
  $.get(`${directoryPath}/${modal}`).then((html) => {
    parent.html(html);
  });
};
