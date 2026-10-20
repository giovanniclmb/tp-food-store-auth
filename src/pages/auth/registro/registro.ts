import { getElement } from "../../../utils/dom";
import { navigate, ROUTES } from "../../../utils/navigate";
import { registerUser } from "../../../utils/userService";

const form = getElement("form", HTMLFormElement);
const inputEmail = getElement("email", HTMLInputElement);
const inputPassword = getElement("password", HTMLInputElement);
const inputConfirm = getElement("confirmPassword", HTMLInputElement);
const message = getElement("message", HTMLParagraphElement);

type MessageType = "error" | "success";

const showMessage = (text: string, type: MessageType): void => {
  message.textContent = text;
  message.style.color = type === "error" ? "crimson" : "green";
};

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  // Regla de la VISTA: es un control de tipeo, no del dominio
  if (inputPassword.value !== inputConfirm.value) {
    showMessage("Las contraseñas no coinciden.", "error");
    return;
  }

  // Reglas del DOMINIO: las decide el servicio
  const result = registerUser({
    email: inputEmail.value,
    password: inputPassword.value,
  });

  if (!result.ok) {
    showMessage(result.error, "error");
    return;
  }

  showMessage(`Cuenta creada para ${result.data.email}. Redirigiendo al login…`, "success");
  form.reset();
  setTimeout(() => navigate(ROUTES.LOGIN), 1500);
});