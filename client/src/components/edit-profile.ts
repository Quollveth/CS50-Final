import {
  usernameExists,
  getUserData,
  updateUserData,
} from '../scripts/helpers/server-talker';
import { showNotification, hideNotification } from '../scripts/helpers/helpers';
import { validateUsername, validateField, readImage } from '../scripts/helpers/helpers';
import { FileError } from '../scripts/helpers/errors';
import { maxImageSize } from '../constants';

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
  const imageInput = $('#profile-pic-input') as JQuery<HTMLInputElement>;

  // Make file upload work
  $('#upload-pic').on('click', () => imageInput.trigger('click'));

  // Close button
  $('#close-btn').on('click', () => {
    modalParent.empty();
    hideNotification();
    window.location.reload();
  });

  // Get current image
  getUserData().then((data) => {
    $('#profile-pic').attr('src', data.picture!);
    $('#username-input').val(data.username as string);
  });

  // Upload image
  imageInput.on('change', () => {
    const file = imageInput.prop('files')[0];
    const reader = new FileReader();
    reader.onload = (e) => {

      if (file.size > maxImageSize) {
        showNotification('Image too large', 'ERROR');
        imageInput.val('');
        return;
      }

      if (file.type !== 'image/png'){
        showNotification('Image must be in png format', 'ERROR');
        imageInput.val('');
        return;
      }

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
  $('#save-profile').on('click', async () => {
    const username = nameIn.val() as string;
    const imageData = imageInput.prop('files')[0];

    if (!validateUsername(username)) {
      showNotification('Invalid username', 'ERROR');
      return;
    }

    let picture = '';
    try{
      picture = await readImage(imageData);
    }
    catch(e){
      if(e instanceof FileError){
        if(imageData !== undefined){
          showNotification('Failed to read image', 'ERROR');
          return;
        }
        else{/* Ignore and move on */}
      }

      //HANDLE: Better error handling
    }

    console.log({ username, picture });

    const result = await updateUserData({ username, picture });
    if(result){
      showNotification('Profile updated', 'SUCCESS');
    }
    else{
      showNotification('Server Error', 'ERROR');
    }

  });
}

$(() => {
  start_modal();
});
