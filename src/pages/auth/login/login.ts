import { getElement } from "../../../utils/dom";
import { HOME_BY_ROL, navigate } from "../../../utils/navigate";
import { loginUser } from "../../../utils/userService";

const form = getElement("form", HTMLFormElement);
const inputEmail = getElement("email", HTMLInputElement);
const inputPassword = getElement("password", HTMLInputElement);
const message = getElement("message", HTMLParagraphElement);

const showError = (text: string): void => {
  message.textContent = text;
  message.style.color = "crimson";
};

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  const result = loginUser({
    email: inputEmail.value,
    password: inputPassword.value,
  });

  if (!result.ok) {
    showError(result.error);
    inputPassword.value = ""; // no dejamos la contraseña fallida en el campo
    inputPassword.focus();
    return;
  }

  // La sesión ya está guardada: el destino lo decide el ROL, no el usuario
  navigate(HOME_BY_ROL[result.data.role]);
});