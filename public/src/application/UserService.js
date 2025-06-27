export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    if (user.password !== password) {
      throw new Error("Contraseña incorrecta");
    }
    return { username: user.username, rol: user.rol };
  }
}