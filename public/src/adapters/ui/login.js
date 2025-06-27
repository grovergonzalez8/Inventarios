import { UserService } from "../../../src/application/UserService.js";
import { UserRepository } from "../../../src/infrastructure/UserRepository.js";

const existingUser = JSON.parse(localStorage.getItem("user"));
if (existingUser) {
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

    localStorage.setItem("user", JSON.stringify(user));

    alert(`Bienvenido ${user.username} - Rol: ${user.rol}`);

    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
});