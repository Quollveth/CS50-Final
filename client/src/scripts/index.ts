import $ from 'jquery';

import { getUserData, type UserData } from './helpers/server-talker';

/* INITIALIZE NOTIFICTION EVENTS */

const alert_btn = $('#alert-btn');
const msg_btn = $('#msg-btn');
const settings_btn = $('#settings-btn');

let notif_visible = false;
const notifBar = $('#notification');
const showNotification = (text:string):void => {
    if(!notif_visible){
        notif_visible = true;
        notifBar.removeClass('hidden');
        const notif_height = notifBar.css('height');
        $('#page').css('margin-top',notif_height);
        $('#topbar').css('margin-top',notif_height);
    }

    $('#notification-text').text(text);
}

const hideNotification = ():void => {
    if(!notif_visible){return;}

    notifBar.addClass('hidden');
    const notif_height = notifBar.css('height');
    $('#page').css('margin-top',0);
    $('#topbar').css('margin-top',0);
}

let alerts = 0;
const alert_notif = $('#alert-notif');
const addAlert = ():void => {
    if(!notif_visible){
        showNotification('New Alert!');
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
    if(!notif_visible){
        showNotification('New Message!');
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

/* FETCH USER DATA AND PUT IT ON SIDEBAR */
const profilePic = $('#profilePic');
const usernameText = $('#username');

getUserData().then((data) => {
    usernameText.text(data.username);
})