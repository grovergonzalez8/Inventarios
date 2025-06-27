export class UserRepository {
  constructor() {
    this.users = [
      { username: "admin", password: "admin123", rol: "admin" },
      { username: "usuario", password: "usuario123", rol: "usuario" },
    ];
  }

  async findByUsername(username) {
    return this.users.find(u => u.username === username) || null;
  }
}