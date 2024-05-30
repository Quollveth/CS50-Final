import $ from 'jquery';

$(()=>{
    $('#upload-pic').on('click',()=> $('#profile-pic-input').trigger('click'));
})