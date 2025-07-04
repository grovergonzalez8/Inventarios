const SECRET_KEY = "UMSS-Posgrado-Derecho-2025@Almacen";

export function obtenerUsuarioSeguro() {
  try {
    const encryptedData = localStorage.getItem("user");
    if (!encryptedData) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;

    const user = JSON.parse(decryptedText);
    if (!validarEstructuraUsuario(user)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Auth Error]:", error);
    return null;
  }
}

export function mostrarNotificacion(mensaje, esError = false) {
  const notificacion = document.createElement("div");
  notificacion.className = `notificacion ${esError ? 'error' : 'exito'}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add("mostrar");
    setTimeout(() => {
      notificacion.classList.remove("mostrar");
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
  }, 100);
}

export function guardarUsuario(user) {
  if (!validarEstructuraUsuario(user)) {
    throw new Error("Estructura de usuario inválida");
  }
  
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(user), 
    SECRET_KEY
  ).toString();
  
  localStorage.setItem("user", encrypted);
}

function validarEstructuraUsuario(user) {
  return !!user && 
         typeof user.username === 'string' && 
         ['admin', 'usuario'].includes(user.rol);
}

export function limpiarSesion() {
  localStorage.removeItem("user");
  sessionStorage.clear();
}

export function redirigirAlLogin() {
  if (!window.location.pathname.includes("login.html")) {
    window.location.href = "login.html";
  }
}

export function tienePermiso(rolRequerido = 'admin') {
  const user = obtenerUsuarioSeguro();
  return user?.rol === rolRequerido;
}