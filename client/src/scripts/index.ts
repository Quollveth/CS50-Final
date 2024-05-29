import $, { get } from 'jquery';

import type { Notification_Color } from './helpers/helpers';
import type { UserData } from './helpers/server-talker';
import { getUserData, logoutUser } from './helpers/server-talker';
import { showNotification, hideNotification, isNotificationVisible, capitalize } from './helpers/helpers';

/* INITIALIZE NOTIFICTION EVENTS */

const alert_btn = $('#alert-btn');
const msg_btn = $('#msg-btn');
const settings_btn = $('#settings-btn');

let alerts = 0;
const alert_notif = $('#alert-notif');
const addAlert = ():void => {
    if(!isNotificationVisible()){
        showNotification('New Alert!', 'INFO');
    }
    if(alert_notif.hasClass('hidden')){
        alert_notif.removeClass('hidden');
    }
    alerts++;

    alert_notif.children().first().text(alerts);
}

alert_btn.on('click',()=>{
    alert_notif.addClass('hidden');
    hideNotification();

    //TODO: Get user alerts
})

let messages = 0;
const message_notif = $('#message-notif');
const addMessage = ():void => {
    if(!isNotificationVisible()){
        showNotification('New Message!', 'INFO');
    }
    if(message_notif.hasClass('hidden')){
        message_notif.removeClass('hidden');
    }
    messages++;

    message_notif.children().first().text(messages);
}

msg_btn.on('click',()=>{
    message_notif.addClass('hidden');
    hideNotification();

    //TODO: Get user messages
})


/* LOG OUT BUTTON */
const logout_btn = $('#sidebar-logout');
logout_btn.on('click',()=>{
    logoutUser().then((result) => {
        if(result){
            window.location.href = 'login.html';
        }
    })
})

/* FETCH USER DATA AND PUT IT ON SIDEBAR */
const profilePic = $('#profilePic');
const usernameText = $('#username');

const getData = async () => {
    const data = await getUserData();
    console.log(data);
    usernameText.text(capitalize(data.username));
    profilePic.attr('src', data.picture!);
}

getData();