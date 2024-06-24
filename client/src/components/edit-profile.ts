import {
  usernameExists,
  getUserData,
  updateUserData,
  validatePassword,
  deleteUser,
} from '../scripts/helpers/server-talker';
import { showNotification, hideNotification } from '../scripts/helpers/helpers';
import {
  validateUsername,
  validateField,
  readImage,
} from '../scripts/helpers/helpers';
import { AuthError, FileError, ServerError } from '../scripts/helpers/errors';
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
  const closeModal = () => {
    modalParent.empty();
    hideNotification();

    // A hack to refresh the page
    $('#reload-page').trigger('click');
  }

  $('#close-btn').on('click', () => {
    closeModal();
  });

  // Close modal on click outside
  $('#darken').on('click', () => {
    closeModal();
  });

  // Get current data
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

      if (file.type !== 'image/png') {
        showNotification('Image must be in png format', 'ERROR');
        imageInput.val('');
        return;
      }

      $('#profile-pic').attr('src', e.target!.result as string);
    };
    try {
      reader.readAsDataURL(file);
    }
    catch(e){
      showNotification('Failed to read image', 'ERROR');
      imageInput.val('');
    }
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

    const formData = new FormData();
    formData.append('username', username);
    if (imageData) {
      formData.append('picture', imageData);
    }

    console.log(formData);

    const result = await updateUserData(formData);
    if (result) {
      showNotification('Profile updated', 'SUCCESS');
    } else {
      showNotification('Server Error', 'ERROR');
    }
  });

  // Delete profile
  $('#delete-profile').on('click', () => {
    $('#confirm-delete').removeClass('hidden');
  });

  $('#confirm-delete-btn').on('click', async () => {
    // Validate password
    const password = $('#password-input').val() as string;


    try {
      const delResult = await deleteUser(password);
      if (delResult) {
        showNotification('Profile deleted', 'SUCCESS');
        setTimeout(() => {
          window.location.href = 'login.html';
          return;
        }, 2000);
      } else {
        showNotification('Incorrect Password', 'ERROR');
        return;
      }
    }
    catch (e:any){
      showNotification(e.message, 'ERROR');
      return;
    }
  });
}

$(() => {
  start_modal();
});
