import {
  usernameExists,
  getUserData,
  updateUserData,
} from '../scripts/helpers/server-talker';
import { showNotification, hideNotification } from '../scripts/helpers/helpers';
import { validateUsername, validateField } from '../scripts/helpers/helpers';

const checkUsername = async (name: string) => {
  const username = name;
  const result = await usernameExists(username);
  if (!result) {
    showNotification('Username available', 'SUCCESS');
  } else {
    showNotification('Username already in use', 'ERROR');
  }
};

function start_modal() {
    const modalParent = $('#profile-edit-page').parent();


  // Make file upload work
  $('#upload-pic').on('click', () => $('#profile-pic-input').trigger('click'));

  // Close button
  $('#close-btn').on('click', () => {
    modalParent.empty();
    hideNotification();
    window.location.reload();
  });

  // Get current image
  getUserData().then((data) => {
    $('#profile-pic').attr('src', data.picture!);
  });

  // Upload image
  $('#profile-pic-input').on('change', () => {
    const file = $('#profile-pic-input').prop('files')[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      $('#profile-pic').attr('src', e.target!.result as string);
    };
    reader.readAsDataURL(file);
  });

  // Username check
  const nameIn = $('#username-input') as JQuery<HTMLInputElement>;
  validateField(nameIn, validateUsername);

  $('#check-name').on('click', async () => {
    checkUsername(nameIn.val() as string);
  });

  //Save
  $('save-profile').on('click', () => {
    const username = nameIn.val() as string;
    const picture = $('#profile-pic-input').prop('files')[0];

    const data = {
      username,
      picture,
    };
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
  });
}

$(()=>{
    start_modal();
})