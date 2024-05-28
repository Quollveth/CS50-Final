import $ from 'jquery';

import { UserData, loginUser } from './helpers/server-talker';


// On document load
$(function () {
    const userForm = document.getElementById('loginForm') as HTMLFormElement;

    // All fields
    const userField = $('#username') as JQuery<HTMLInputElement>;
    const passwordField = $('#password') as JQuery<HTMLInputElement>;

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const data = {
            username: userField.val() as string,
            password: passwordField.val() as string
        };

        const result = await loginUser(data);

        //HANDLE: This should be a try catch
        if (result === 'INVALID') {
            alert('Invalid username or password');
            location.reload();
            return;
        }

        window.location.href = 'index.html'
    });
    
});
