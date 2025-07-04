import { obtenerUsuarioSeguro } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = obtenerUsuarioSeguro();
  const navbar = document.querySelector(".navbar ul");

  if (user) {
    const isAdmin = user.rol === "admin";

    navbar.innerHTML = `
      <li><a href="index.html" ${isActive('index.html')}>Inicio</a></li>
      ${isAdmin ? `<li><a href="ingresar.html" ${isActive('ingresar.html')}>Ingresar</a></li>` : ''}
      <li><a href="retirar.html" ${isActive('retirar.html')}>Retirar</a></li>
      <li><a href="reportes.html" ${isActive('reportes.html')}>Reportes</a></li>
      ${isAdmin ? `<li><a href="modificar.html" ${isActive('modificar.html')}>Inventario</a></li>` : ''}
      <li><a href="#" id="logout">Cerrar sesión</a></li>
    `;

    document.getElementById("logout").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
});

function isActive(page) {
  return window.location.pathname.includes(page) ? 'class="active"' : '';
}