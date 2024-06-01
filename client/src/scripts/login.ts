import type { UserData } from './helpers/server-talker';
import { loginUser, HealthCheck } from './helpers/server-talker';
import { showNotification } from './helpers/helpers';

// On document load
$(function () {

    // Attempt server connection
    HealthCheck().then((result) => {
        if (!result) {
            showNotification('Server is down', 'ERROR');
        }
    });

    const userForm = document.getElementById('loginForm') as HTMLFormElement;

    // All fields
    const userField = $('#username') as JQuery<HTMLInputElement>;
    const passwordField = $('#password') as JQuery<HTMLInputElement>;

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data:UserData = {
            username: userField.val() as string,
            password: passwordField.val() as string
        };

        try {
            const result = await loginUser(data);            
            if (result === false) {
                showNotification('Invalid username or password', 'ERROR');
                passwordField.val('');
                return;
            }            
            window.location.href = 'index.html'
        }
        catch (e: any){
            showNotification(e.message, 'ERROR');
        }
    });

});
