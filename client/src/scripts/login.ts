import $ from 'jquery';

$(function () {
  const changeFormBtn = document.getElementById(
    'change-button'
  ) as HTMLButtonElement;
  changeFormBtn.addEventListener('click', () => {
    window.location.href = 'register.html';
    return;
  });
});
