import $ from 'jquery';

import { createForm } from './scripts/formCreator';

const SERVER_IP = 'http://127.0.0.1:8080';
let userForm:HTMLFormElement;

// On document load
$(function () {
  userForm = document.getElementById('user-form-body') as HTMLFormElement;
  /*
  userForm = document.createElement('form') as HTMLFormElement;
  userForm.classList.add('user-form');
  userForm.id = 'user-form-body';
  document.appendChild(userForm);
  */
  createForm('LOGIN', userForm);

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
