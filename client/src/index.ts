import $ from 'jquery';

const SERVER_IP = 'http://127.0.0.1:8080';

// On document load
$(function () {
  window.location.href = './login.html';
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
