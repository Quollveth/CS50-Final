import { getUserData, logoutUser } from './helpers/server-talker';
import { showNotification, hideNotification, isNotificationVisible, capitalize } from './helpers/helpers';
import { loadComponent } from './helpers/helpers';

/* INITIALIZE NOTIFICTION EVENTS */

const alert_btn = $('#alert-btn');
const msg_btn = $('#msg-btn');

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
const logout_btn = $('#logout-btn');
logout_btn.on('click',()=>{
    try {
        logoutUser().then((result) => {
            window.location.href = 'login.html';
        });
    }
    catch(e:any){
        showNotification(e.message, 'ERROR');
    }
})

/* FETCH USER DATA AND PUT IT ON SIDEBAR */
const profilePic = $('#profilePic');
const usernameText = $('#username');

const getData = async () => {
    const data = await getUserData();
    usernameText.text(capitalize(data.username));
    profilePic.attr('src', data.picture!);
}

/* TOGGLE SETTINGS */
const settings = $('#settings-btn');
const settingsMenu = $('#settings-dropdown');

settings.on('mouseenter',()=>{
    settingsMenu.removeClass('hidden');
});
settingsMenu.on('mouseleave',()=>{
    settingsMenu.addClass('hidden');
});


$('#profile-btn').on('click',()=>{
    loadComponent('/components/edit-profile.html',$('#modal-holder'));
})


// Sidebar pages
const pages = {
    home: $('#sidebar-home'),
    writer: $('#sidebar-writer'),
    hire: $('#sidebar-hire')
} as const;
type Page = keyof typeof pages;

let currentPage:Page = 'home';

const loadSubpage = (page:Page):void => {
    pages[currentPage].removeClass('active');
    pages[page].addClass('active');
    currentPage = page;

    switch(page){
        case 'home':
            loadComponent('/subpages/subpage-home.html',$('#subpage'));
            break;
        case 'writer':
            loadComponent('/subpages/subpage-writer.html',$('#subpage'));
            break;
        case 'hire':
            loadComponent('/subpages/subpage-hire.html',$('#subpage'));
            break;
    }
}


$('#sidebar-home').on('click',()=>{
    loadSubpage('home');
});

$('#sidebar-writer').on('click',()=>{
    loadSubpage('writer');
});

$('#sidebar-hire').on('click',()=>{
    loadSubpage('hire');
});


$(()=>{
   loadPage();
})
$('#reload-page').on('click',()=>{
    loadPage();
});
function loadPage(){
    loadSubpage(currentPage);
    try {
        getData();
    }
    catch(e:any){
        showNotification(e.message, 'ERROR');
    }
}