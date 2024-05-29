let notif_visible = false;
const notifBar = $('#global-notification');
export const showNotification = (text:string):void => {
    if(!notif_visible){
        notif_visible = true;
        notifBar.removeClass('hidden');
        const notif_height = notifBar.css('height');
        $('#page').css('margin-top',notif_height);
        $('#topbar').css('margin-top',notif_height);
    }

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