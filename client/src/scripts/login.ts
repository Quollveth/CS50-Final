import $ from 'jquery';

import type { UserData } from './helpers/server-talker';
import { loginUser, HealthCheck } from './helpers/server-talker';
import type { Notification_Color } from './helpers/notification';
import { showNotification, hideNotification } from './helpers/notification';

// On document load
$(function () {

    // Attempt server connection
    HealthCheck().then((result) => {
        if (!result) {
            showNotification('Server is down', 'ERROR');
        }
        else {
            showNotification('Server is up', 'SUCCESS');
        }
    });

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
