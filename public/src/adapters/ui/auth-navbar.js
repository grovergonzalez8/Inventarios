const user = JSON.parse(localStorage.getItem("user"));
const navbar = document.querySelector(".navbar ul");

if (user) {
  const isAdmin = user.rol === "admin";

  navbar.innerHTML = `
    <li><a href="index.html">Inicio</a></li>
    ${isAdmin ? '<li><a href="ingresar.html">Ingresar</a></li>' : ''}
    <li><a href="retirar.html">Retirar</a></li>
    <li><a href="#" class="disabled">Reportes</a></li>
    <li><a href="#" id="logout">Cerrar sesión</a></li>
  `;

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

} else {
  const path = window.location.pathname;
  if (path.includes("ingresar.html") || path.includes("retirar.html")) {
    window.location.href = "login.html";
  }
}