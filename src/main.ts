import "./style.css";
import { initGuard } from "./utils/auth";
import { ensureDefaultAdmin } from "./utils/userService";

ensureDefaultAdmin();
initGuard();