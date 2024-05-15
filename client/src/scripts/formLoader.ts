export type formType = 'REGISTER' | 'LOGIN';

type inputType = 'USER' | 'EMAIL' | 'PASS' | 'CONFIRM';

const createInput = (
  type: inputType,
  required: boolean = false
): HTMLLabelElement => {
  const input = document.createElement('input') as HTMLInputElement;
  const label = document.createElement('lablel') as HTMLLabelElement;

  switch (type) {
    case 'USER':
      input.id = 'username';
      input.name = 'username';
      input.type = 'text';
      label.setAttribute('for', 'username');
      label.innerText = 'Username:';

      break;

    case 'PASS':
      input.id = 'password';
      input.name = 'password';
      input.type = 'password';
      label.setAttribute('for', 'password');
      label.innerText = 'Password:';

      break;

    case 'CONFIRM':
      input.id = 'confirm';
      input.name = 'confirm';
      input.type = 'password';
      label.setAttribute('for', 'confirm');
      label.innerText = 'Confirm Password:';

      break;

    case 'EMAIL':
      input.id = 'email';
      input.name = 'email';
      input.type = 'text';
      label.setAttribute('for', 'email');
      label.innerText = 'Email';

      break;
  }

  input.classList.add('user-form');
  label.classList.add('user-form');

  label.appendChild(input);

  input.required = required;

  return label;
};

function loadLoginForm() {}

export function loadForm(type: formType, root: HTMLFormElement) {}
