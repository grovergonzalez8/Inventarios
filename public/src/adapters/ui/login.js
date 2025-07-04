import { UserService } from "../../../src/application/UserService.js";
import { UserRepository } from "../../../src/infrastructure/UserRepository.js";
import { guardarUsuario, obtenerUsuarioSeguro } from "./auth.js";

// Redirigir si ya está logueado
if (obtenerUsuarioSeguro()) {
  window.location.href = "index.html";
}

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const user = await userService.login(username, password);
    guardarUsuario(user);
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
});