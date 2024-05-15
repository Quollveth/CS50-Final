import $ from 'jquery';

const SERVER_IP = 'http://127.0.0.1:8080';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm') as HTMLFormElement;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const username = (<HTMLInputElement>document.getElementById('username'))
      .value;
    const email = (<HTMLInputElement>document.getElementById('email')).value;
    const password = (<HTMLInputElement>document.getElementById('password'))
      .value;
    const confirmPassword = (<HTMLInputElement>(
      document.getElementById('confirmPassword')
    )).value;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    $.post(`${SERVER_IP}/test`, { username, email, password })
      .done(function (response) {
        alert('Registration successful');
        console.log(response);
      })
      .fail(function (error) {
        alert('Registration failed');
      });
  });
});
