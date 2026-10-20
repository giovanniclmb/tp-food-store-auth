# 🍔 Food Store — Autenticación y Roles con TypeScript

Trabajo Práctico Integrador de **Desarrollo de Software**: evolución de la aplicación "Food Store" hacia un sistema con **registro, login, sesión persistente y protección de rutas por rol**, usando **TypeScript**, **Vite** y **localStorage** como base de datos simulada.

---

## ✨ Funcionalidades

- **Registro de usuarios** con validación de formato de email, longitud mínima de contraseña y **bloqueo de emails duplicados** (sin distinguir mayúsculas ni espacios).
- **Login real**: las credenciales se validan contra los usuarios registrados en `localStorage`. El rol **lo decide el sistema**, no el usuario.
- **Sesión persistente**: sobrevive a recargas y al cierre del navegador hasta que se hace logout.
- **Protección de rutas centralizada** (`src/main.ts`): ninguna página privada es accesible escribiendo la URL sin sesión o con el rol equivocado.
- **Redirección inteligente**: cada usuario es enviado a su zona permitida, y un usuario logueado que entra al login/registro va directo a su home.
- **Robustez extra del guard**: cubre el botón "Atrás" (bfcache), el logout en otra pestaña y oculta el contenido hasta validar el acceso.
- **Admin inicial** creado automáticamente para poder probar la zona de administración.

---

## 📋 Requisitos

- **Node.js** `20.19+` o `22.12+` (requisito de Vite 7). Verificá tu versión con `node -v`.
- **pnpm** (recomendado) o **npm**.

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
```

### 2. Instalar dependencias

Con pnpm (si no lo tenés: `npm install -g pnpm`):

```bash
pnpm install
```

O con npm:

```bash
npm install
```

### 3. Levantar el servidor de desarrollo

```bash
pnpm dev        # o: npm run dev
```

Abrí la URL que muestra la terminal (normalmente `http://localhost:5173`). La raíz redirige automáticamente al login.

### 4. (Opcional) Build de producción

```bash
pnpm build      # chequea tipos con tsc y genera /dist
pnpm preview    # sirve el build localmente
```

> `pnpm dev` no chequea tipos (Vite solo transpila). El chequeo estricto de TypeScript ocurre en `pnpm build`.

---

## 🔑 Credenciales de prueba

| Rol | Email | Contraseña | Cómo se obtiene |
|---|---|---|---|
| `admin` | `admin@foodstore.com` | `admin123` | Se crea automáticamente al abrir la app |
| `client` | el que elijas | mínimo 6 caracteres | Registrándote en `/registro` |

> El formulario de registro **no permite elegir rol** (así lo pide el enunciado): todo usuario nuevo es `client`. Por eso existe un admin "semilla", equivalente a los datos iniciales que se cargan en una base de datos.

---

## 🧪 Cómo probar la protección

Con `pnpm dev` levantado:

1. **Sin sesión**, pegá en la barra `/src/pages/admin/home/home.html` → redirige al **login** sin mostrar el panel.
2. **Registrate** y logueate como client → llegás a la **home de cliente**.
3. Como client, intentá entrar a `/src/pages/admin/home/home.html` → volvés a **tu home de cliente**.
4. Ya logueado, entrá a `/src/pages/auth/login/login.html` → te manda a **tu home**.
5. Logueate como **admin** (`admin@foodstore.com` / `admin123`) → panel de administración.
6. Hacé **logout** y apretá **Atrás** → vas al login, no al panel.
7. Abrí el panel en **dos pestañas** y hacé logout en una → la otra redirige al login sola.
8. Intentá registrar dos veces el mismo email (o con otras mayúsculas) → se rechaza.

Para inspeccionar los datos: **DevTools → Application → Local Storage**.

---

## 🗂️ Estructura del proyecto

```
src/
├── main.ts                    # Punto de entrada común: seed del admin + guard
├── types/                     # Contratos de datos
│   ├── Rol.ts                 #   ROLES, tipo Rol y type guard isRol
│   └── IUser.ts               #   IUser, ISession y type guards isUser / isSession
├── utils/
│   ├── localStorage.ts        # Persistencia: lectura/escritura segura de "users" y "userData"
│   ├── userService.ts         # Reglas de negocio: registro, login, admin semilla
│   ├── auth.ts                # Guard de rutas (resolveRedirect + initGuard) y logout
│   ├── navigate.ts            # Rutas centralizadas (ROUTES), home por rol, navegación
│   └── dom.ts                 # getElement<T>: acceso tipado y verificado al DOM
└── pages/
    ├── auth/                  # Zona pública
    │   ├── login/             #   login.html + login.ts
    │   └── registro/          #   registro.html + registro.ts
    ├── admin/home/            # Zona exclusiva de admin
    └── client/home/           # Zona exclusiva de client
```

### Arquitectura en capas

```
Vista (pages/*.ts)        → lee formularios y muestra mensajes. No conoce localStorage.
        ↓
Servicio (userService.ts) → reglas de negocio: validaciones, duplicados, rol por defecto.
        ↓
Persistencia (localStorage.ts) → lee/escribe JSON validado. No conoce reglas.
```

Cada capa tiene una sola responsabilidad. Gracias a esto, reemplazar `localStorage` por una API real implica cambiar **solo** la capa de persistencia/servicio, sin tocar las vistas.

---

## 💾 Modelo de datos (localStorage)

| Clave | Tipo | Contenido |
|---|---|---|
| `users` | `IUser[]` | La "tabla" de usuarios registrados |
| `userData` | `ISession` | La sesión activa (**nunca incluye la contraseña**) |

```jsonc
// users
[
  { "email": "admin@foodstore.com", "password": "admin123", "role": "admin" },
  { "email": "gio@mail.com",        "password": "123456",   "role": "client" }
]

// userData
{ "email": "gio@mail.com", "role": "client", "loggedIn": true }
```

---

## 🛡️ Cómo funciona la protección de rutas

Cada página carga **primero** `src/main.ts` y después su propio script. Como los `<script type="module">` se ejecutan en orden, el guard siempre decide antes que la página:

```html
<body hidden>
  ...
  <script type="module" src="/src/main.ts"></script>   <!-- 1) guard -->
  <script type="module" src="./home.ts"></script>      <!-- 2) lógica de la página -->
</body>
```

El guard determina la **zona** según la carpeta (`/pages/auth/`, `/pages/admin/`, `/pages/client/`) y la compara con la sesión:

| Página \ Sesión | Sin sesión | `client` | `admin` |
|---|---|---|---|
| `/auth/` (login, registro) | ✅ permitido | → home client | → home admin |
| `/client/` | → login | ✅ permitido | → home admin |
| `/admin/` | → login | → home client | ✅ permitido |
| Carpeta desconocida | → login | → home client | → home admin |

Detalles de diseño:

- **Decisión pura**: `resolveRedirect(pathname, session)` no toca el DOM ni el storage, lo que la hace predecible y testeable.
- **Denegar por defecto**: una carpeta no reconocida se trata como privada, y el `<body>` arranca oculto (`hidden`): solo se muestra si el guard aprueba el acceso. Esto evita además que el contenido protegido "parpadee" antes de redirigir.
- **Sin bucles**: todo destino de redirección es una página permitida para ese mismo estado de sesión.
- **Botón "Atrás"**: el navegador puede restaurar una página desde su caché (bfcache) sin ejecutar scripts. El evento `pageshow` (`persisted === true`) vuelve a correr el guard.
- **Varias pestañas**: el evento `storage` detecta un logout hecho en otra pestaña.

---

## 🔷 Uso de TypeScript

El proyecto no usa `any`. Los datos que vienen "de afuera" (localStorage, URL, formularios) se tratan como `unknown` y se validan antes de usarse.

| Recurso | Dónde | Para qué |
|---|---|---|
| `as const` + tipo derivado | `ROLES`, `ROUTES`, `STORAGE_KEYS` | Una sola fuente de verdad: el tipo se deriva del valor real |
| Type guards (`value is T`) | `isRol`, `isUser`, `isSession` | Validar en runtime lo que TypeScript no puede garantizar |
| Utility types | `Omit<IUser, "password">`, `Pick<…>` | `ISession` es una proyección de `IUser` sin la contraseña |
| Unión discriminada | `Result<T>` | Registro y login devuelven éxito o error; el compilador obliga a manejar ambos |
| `Record<Rol, Route>` | `HOME_BY_ROL` | Si se agrega un rol, el código no compila hasta asignarle una home |
| Genéricos | `getElement<T>(id, HTMLInputElement)` | Acceso al DOM verificado en runtime, sin `as` |

> No se usan `enum` porque el `tsconfig` tiene `erasableSyntaxOnly`, que prohíbe sintaxis de TypeScript que genere código en runtime.

---

## ⚠️ Limitaciones de seguridad (importante)

Este proyecto es **educativo**. La protección es real a nivel de lógica de navegación, pero **no es segura para producción**:

- **localStorage es editable**: cualquiera puede abrir DevTools y escribir una sesión con `"role": "admin"`. El frontend no tiene forma de distinguirla de una legítima.
- **Contraseñas en texto plano**: en un sistema real se guarda un **hash** (bcrypt, argon2), nunca la contraseña.
- **El HTML es público**: los archivos de la zona admin pueden descargarse igual; el guard solo impide navegarlos.

La seguridad real se implementa en el **backend**: el servidor valida las credenciales, emite un **token firmado** (por ejemplo, JWT) y lo verifica en **cada request**. El frontend solo mejora la experiencia de usuario.

---

## 🔌 Preparado para una API

La lógica quedó aislada para que el salto a un backend real sea acotado:

- `IUser` e `ISession` funcionan como los **DTOs** que devolvería la API.
- `userService.ts` reemplazaría `getUsers()`/`saveUsers()` por `fetch("/api/auth/register")` y `fetch("/api/auth/login")`, pasando a funciones `async` que devuelvan `Promise<Result<T>>`.
- La sesión guardaría el **token** devuelto por el servidor en lugar del usuario.
- Las vistas y el guard **no cambian**: siguen consumiendo `Result<T>` e `ISession`.

---

## ✅ Cumplimiento del enunciado

| Requisito | Implementación |
|---|---|
| **Paso 1** — Registro con email y contraseña, sin selector de rol | `registro.html` / `registro.ts` → `registerUser()` |
| **Paso 1** — Array de objetos en `localStorage["users"]` | `saveUsers()` en `localStorage.ts` |
| **Paso 2** — Login que valida email + contraseña contra `users` | `loginUser()` en `userService.ts` |
| **Paso 2** — Sesión en `localStorage["userData"]` | `saveSession()` (sin contraseña) |
| **Paso 3** — Función centralizada en `src/main.ts` | `initGuard()`, cargado primero por todas las páginas |
| **Paso 3** — Un client en `/admin/` es redirigido | `resolveRedirect()` → home de client |
| Tipado fuerte con interfaces | `IUser`, `ISession`, `Rol`, `Result<T>`; sin `any` |
| Sin registros duplicados | Email normalizado + chequeo en `registerUser()` |
| No evadible recargando | El guard corre en cada carga, en el bfcache y entre pestañas |

---

## 🛠️ Tecnologías

- [TypeScript](https://www.typescriptlang.org/) 5.8 (modo `strict`)
- [Vite](https://vite.dev/) 7 (app multi-página)
- Web Storage API (`localStorage`)

---

## 👤 Autor

**Giovanni** — [@giovanniclmb](https://github.com/giovanniclmb)
Desarrollo de Software — Trabajo Práctico Integrador TypeScript

Proyecto base provisto por la cátedra: [chiro45/proteger_rutas](https://github.com/chiro45/proteger_rutas)