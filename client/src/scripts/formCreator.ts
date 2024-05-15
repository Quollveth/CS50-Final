export type formType = 'REGISTER' | 'LOGIN';

type inputType = 'USER' | 'EMAIL' | 'PASS' | 'CONFIRM';

const createInput = (
  type: inputType,
  required: boolean = true
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

export function createForm(type: formType, root: HTMLFormElement) {
  // Create input fields
  root.appendChild(createInput('USER'));
  root.appendChild(createInput('PASS'));
  if (type == 'REGISTER') {
    root.appendChild(createInput('EMAIL'));
    root.appendChild(createInput('CONFIRM'));
  }

  // Create buttons
  let submit = document.createElement('button') as HTMLButtonElement;
  submit.classList.add('user-form');
  submit.id = 'submit-button';
  submit.type = 'submit';

  submit.innerText = type == 'REGISTER' ? 'Register' : 'Log In';

  let change = document.createElement('button') as HTMLButtonElement;
  change.classList.add('user-form');
  change.id = 'change-button';

  let changeLabel = document.createElement('label') as HTMLLabelElement;
  changeLabel.setAttribute('for', change.id);
  changeLabel.classList.add('user-form');
  changeLabel.id = 'change-label';

  changeLabel.innerText =
    type == 'REGISTER'
      ? 'Already have an account?'
      : "Don't yet have an account?";
  change.innerText = type == 'REGISTER' ? 'Log In' : 'Register';

  // Create divs to organize the buttons
  let container = document.createElement('div') as HTMLDivElement;
  let container2 = document.createElement('div') as HTMLDivElement;

  container.classList.add('user-form');
  container.id = 'buttons';

  container.appendChild(submit);

  container2.appendChild(changeLabel);
  container2.appendChild(change);

  container.appendChild(container2);
  root.appendChild(container);
}
