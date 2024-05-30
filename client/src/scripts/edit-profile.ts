import $ from 'jquery';
import { validateUsername, validateField } from './register';
import { usernameExists, getUserData, updateUserData } from './helpers/server-talker';
import { showNotification, hideNotification } from './helpers/helpers';

const checkUsername = async (name:string)=>{
    const username = name;
    const result = await usernameExists(username);
    if(!result){
        showNotification('Username available', 'SUCCESS');
    }
    else{
        showNotification('Username already in use', 'ERROR');
    }
}

let modalParent:JQuery<HTMLElement>;
function start_modal(){
    // Make file upload work
    $('#upload-pic').on('click',()=> $('#profile-pic-input').trigger('click'));

    // Close button
    $('#close-btn').on('click',()=>{
        modalParent.empty();
        hideNotification();
        window.location.reload();
    })

    // Get current image
    getUserData().then((data)=>{
        $('#profile-pic').attr('src', data.picture!);
    })

    // Upload image
    $('#profile-pic-input').on('change',()=>{
        const file = $('#profile-pic-input').prop('files')[0];
        const reader = new FileReader();
        reader.onload = (e)=>{
            $('#profile-pic').attr('src', (e.target!).result as string);
        }
        reader.readAsDataURL(file);
    })

    // Username check
    const nameIn = $('#username-input') as JQuery<HTMLInputElement>;
    validateField(nameIn, validateUsername);

    $('#check-name').on('click',async ()=>{checkUsername(nameIn.val() as string)});

    //Save
    $('save-profile').on('click',()=>{
        const username = nameIn.val() as string;
        const picture = $('#profile-pic-input').prop('files')[0];

        const data = {
            username,
            picture
        }
/*
        updateUserData(data).then((result)=>{
            if(result){
                showNotification('Profile Updated', 'SUCCESS');
            }
            else{
                showNotification('Server Error', 'ERROR');
            }
        })
        */
    })
}

export function loadEditModal(parent:JQuery<HTMLElement>){
    modalParent = parent;
    const currentURL = window.location.href;
    const directoryPath = currentURL.substring(0, currentURL.lastIndexOf('/'));
    $.get(`${directoryPath}/edit-profile.html`).then((html)=>{
        modalParent.html(html);
        start_modal();
    })
}