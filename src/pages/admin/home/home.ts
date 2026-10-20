import { logout } from "../../../utils/auth";
import { getElement } from "../../../utils/dom";
import { getSession } from "../../../utils/localStorage";

// La protección ya la hizo main.ts: esta página solo se ocupa de SU contenido
const session = getSession();
getElement("userInfo", HTMLParagraphElement).textContent = session
  ? `Sesión iniciada como ${session.email} (${session.role})`
  : "";

getElement("logoutButton", HTMLButtonElement).addEventListener("click", logout);
