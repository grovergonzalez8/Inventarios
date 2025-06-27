import { UserService } from "../../../src/application/UserService.js";
import { UserRepository } from "../../../src/infrastructure/UserRepository.js";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const user = await userService.login(username, password);
    alert(`Bienvenido ${user.username} - Rol: ${user.rol}`);

    if (user.rol === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "usuario.html";
    }
  } catch (error) {
    alert(error.message);
  }
});