import $ from 'jquery';

import { registerUser } from './helpers/server-talker';
import type { UserData, RegistResult } from './helpers/server-talker';

let userForm: HTMLFormElement;

async function usernameExists(usr: string): Promise<boolean> {
  /** Checks if a username already exists in the server
   * @returns Promise resolving to wether or not the given username exists
   */
  //TODO: Query the server for data, placeholder promise for now
  return new Promise((resolve) => {
    resolve(true);
  });
};

async function sendRegisterForm(data: UserData): Promise<RegistResult> {
  const exists = await usernameExists(data.username);

  if (exists) {
    return 'EXISTS';
  }

  return await registerUser(data);
}

const validadeUsername = (str: string) => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

const validateEmail = (str: string) => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str);
};

const validatePassword = (str: string) => {
  /*
   * At least 8 characters long
   * One uppercase letter
   * One lowercase letter
   * One digit
   */
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(str);
};

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

$(function () {
  const changeFormBtn = document.getElementById(
    'change-button'
  ) as HTMLButtonElement;
  changeFormBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
    return;
  });

  userForm = document.getElementById('registerForm') as HTMLFormElement;

  const userField = $('#username') as JQuery<HTMLInputElement>;
  const emailField = $('#email') as JQuery<HTMLInputElement>;
  const passwordField = $('#password') as JQuery<HTMLInputElement>;
  const confirmField = $('#confirmPassword') as JQuery<HTMLInputElement>;

  const checkButton = $('#check-user') as JQuery<HTMLButtonElement>;
  const takenLabel = $('#username-taken-label') as JQuery<HTMLLabelElement>

  checkButton.on('click', () => {
    usernameExists(userField.val() as string).then(result => {
      takenLabel.removeClass('hidden');
      if(!result){
        takenLabel.addClass('valid');
        takenLabel.removeClass('invalid');
        takenLabel.text('Username available');
        return;
      }
      takenLabel.addClass('invalid');
      takenLabel.removeClass('valid');
      takenLabel.text('Username already in use');
    })
  });

  validateField(userField, validadeUsername);
  validateField(emailField, validateEmail);
  validateField(passwordField, validatePassword);
  validateField(confirmField, () => passwordField.val() === confirmField.val());

  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validadeUsername(userField.val() as string)) {
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

    const data: UserData = {
      username: userField.val() as string,
      email: emailField.val() as string,
      password: passwordField.val() as string
    };

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
          window.location.href = '/';
      }
    });
  });
});
