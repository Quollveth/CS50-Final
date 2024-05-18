import $ from 'jquery';

import { registerUser } from './helpers/server-talker';
import type { UserData } from './helpers/server-talker';

let userForm: HTMLFormElement;

let userField: HTMLInputElement;
let emailField: HTMLInputElement;
let passwordField: HTMLInputElement;
let confirmField: HTMLInputElement;

async function sendRegisterForm() {
  alert('Registering');
  let username = userField.value;
  let email = emailField.value;
  let password = passwordField.value;
  let confirmed = confirmField.value;

  //validade data

  const data: UserData = {
    username: username,
    email: email,
    password: password
  };

  const result = await registerUser(data);
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

  userField = document.getElementById('username') as HTMLInputElement;
  emailField = document.getElementById('email') as HTMLInputElement;
  passwordField = document.getElementById('password') as HTMLInputElement;
  confirmField = document.getElementById('confirmPassword') as HTMLInputElement;

  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendRegisterForm();
  });
});
