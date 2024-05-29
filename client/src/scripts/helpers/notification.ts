import $ from 'jquery';

export const notifColors = {
    ERROR: '#ff4d4d',
    SUCCESS: '#4dff4d',
    INFO: '#4d4dff',
    WARNING: '#ffcc00'
} as const;
export type Notification_Color = keyof typeof notifColors;


let notif_visible = false;
const notifBar = $('#global-notification');
export const showNotification = (text:string,color:Notification_Color):void => {
    if(!notif_visible){
        notif_visible = true;
        notifBar.removeClass('hidden');
        const notif_height = notifBar.css('height');
        $('#page').css('margin-top',notif_height);
        $('#topbar').css('margin-top',notif_height);
    }
    notifBar.css('background-color',notifColors[color]);
    $('#global-notification-text').text(text);
}

export const hideNotification = ():void => {
    if(!notif_visible){return;}

    notifBar.addClass('hidden');
    const notif_height = notifBar.css('height');
    $('#page').css('margin-top',0);
    $('#topbar').css('margin-top',0);
}

export const isNotificationVisible = ():boolean => notif_visible;