import $ from 'jquery';

import { registerUser } from './helpers/server-talker';
import type { UserData, RegistResult } from './helpers/server-talker';

/** Checks if a username already exists in the server
 * @returns Promise resolving to wether or not the given username exists
 */
async function usernameExists(usr: string): Promise<boolean> {
  //TODO: Query the server for data, placeholder promise for now
  return new Promise((resolve) => {
    resolve(true);
  });
};

async function sendRegisterForm(data: UserData): Promise<RegistResult> {
  return usernameExists(data.username).then(async result => {
    if(result){
      return 'EXISTS';
    }
    return await registerUser(data)
  })
}

const validateUsername = (str: string) => /^[a-zA-Z0-9]+$/.test(str);
const validateEmail = (str: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str);
/*
  * At least 8 characters long
  * One uppercase letter
  * One lowercase letter
  * One digit
*/
const validatePassword = (str: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(str);

/**
 * Visual feedback for registration fields
 * @param field field to validate
 * @param validationFn function to validate, must receive string and return boolean
 * @sideEffect input receives valid or invalid class
 */
function validateField(
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

// On document load
$(function () {
  // Already have an account? Go to login page
  const changeFormBtn = document.getElementById(
    'change-button'
  ) as HTMLButtonElement;
  changeFormBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
    return;
  });

  // Actual registration stuff goes here
  const userForm = document.getElementById('registerForm') as HTMLFormElement;

  // All fields
  const userField = $('#username') as JQuery<HTMLInputElement>;
  const emailField = $('#email') as JQuery<HTMLInputElement>;
  const passwordField = $('#password') as JQuery<HTMLInputElement>;
  const confirmField = $('#confirmPassword') as JQuery<HTMLInputElement>;

  // Is username in use button
  const checkButton = $('#check-user') as JQuery<HTMLButtonElement>;
  const takenLabel = $('#username-taken-label') as JQuery<HTMLLabelElement>

  // Hide label when username updates
  userField.on('input', () => {
    takenLabel.addClass('hidden');
  });

  const updateLabel = (text: string, className: string) => {
    takenLabel.removeClass('hidden valid invalid').addClass(className).text(text);
  }

  checkButton.on('click', () => {
    const username = userField.val() as string;
  
    if (!validateUsername(username)) {
      updateLabel('Invalid username', 'invalid');
      return;
    }
  
    usernameExists(username).then(result => {
      if (!result) {
        updateLabel('Username available', 'valid');
      } else {
        updateLabel('Username already in use', 'invalid');
      }
    });
  });

  // Updates fields as user is typing
  validateField(userField, validateUsername);
  validateField(emailField, validateEmail);
  validateField(passwordField, validatePassword);
  validateField(confirmField, () => passwordField.val() === confirmField.val());

  // Send form to server
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clientside validation
    if (!validateUsername(userField.val() as string)) {
      alert('Invalid Username');
      return;
    }
    if (!validateEmail(emailField.val() as string)) {
      alert('Invalid Email');
      return;
    }
    if (!validatePassword(passwordField.val() as string)) {
      alert('Invalid Password');
      return;
    }

    // Assembler data and send
    const data: UserData = {
      username: userField.val() as string,
      email: emailField.val() as string,
      password: passwordField.val() as string
    };

    // Handle possible results
    sendRegisterForm(data).then((result) => {
      switch (result) {
        case 'EXISTS':
          alert('Username already in use!');
          break;
        case 'INVALID':
          alert('Invalid Data');
          break;
        case 'SUCCESS':
          alert('Registration Successfull');
          window.location.href = '/index';
      }
    });
  });
});
