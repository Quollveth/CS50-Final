import $ from 'jquery';

import { createForm } from './scripts/formCreator';
import type { formType } from './scripts/formCreator';

const SERVER_IP = 'http://127.0.0.1:8080';
let userForm: HTMLFormElement;

let currentForm: formType = 'LOGIN';

const swapForms = () => {
  userForm.innerHTML = ''; // Remove all children
  currentForm = currentForm == 'LOGIN' ? 'REGISTER' : 'LOGIN'; // Swap form type
  createForm(currentForm, userForm); // Create new form
  const swapButton = document.getElementById(
    'change-button'
  ) as HTMLButtonElement;
  swapButton.addEventListener('click', swapForms);
};

// On document load
$(function () {
  // Create login page
  userForm = document.createElement('form') as HTMLFormElement;
  userForm.classList.add('user-form');
  userForm.id = 'user-form-body';
  document.body.appendChild(userForm);

  createForm(currentForm, userForm);

  // Swap between login and register page
  const swapButton = document.getElementById(
    'change-button'
  ) as HTMLButtonElement;
  swapButton.addEventListener('click', swapForms);
});

/*
form.addEventListener('submit', function (event) {
  event.preventDefault();

  $.post(`${SERVER_IP}/login`, {})
    .done(function (response) {
      alert('Login successful');
      console.log(response);
    })
    .fail(function (error) {
      alert('Login failed');
    });
});
*/
