import UserDTO from "../DTO/user.dto.js";

export default class UserService {
  constructor(userDAO, cartDAO) {
    this.userDAO = userDAO;
    this.cartDAO = cartDAO;
  }
  async createUser(data) {
    try {
      const user = await this.userDAO.createUser(data);
      return user;
    } catch (error) {
      throw error;
    }
  }
  async getUserById(id) {
    try {
      const user = await this.userDAO.getUserById(id);
      return user;
    } catch (error) {
      throw error;
    }
  }
  async getUsers() {
    try {
      const users = await this.userDAO.getUsers();
      return users.map((user) => new UserDTO(user));
    } catch (error) {
      throw error;
    }
  }
  async getUserByEmail(email) {
    try {
      const user = await this.userDAO.getUserByEmail(email);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmailCode(email, verificationCode) {
    try {
      const user = await this.userDAO.getUserByEmailCode(
        email,
        verificationCode
      );
      return new UserDTO(user);
    } catch (e) {
      throw e;
    }
  }

  async updateUser(id, data) {
    try {
      const user = await this.userDAO.updateUser(id, data);
      return new UserDTO(user);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await this.userDAO.deleteUser(id);
      return new UserDTO(user);
    } catch (error) {
      throw error;
    }
  }

  addCartToUser = async (userId, cartId) => {
    try {
      const user = await this.userDAO.getUserById(userId);
      user.cart.push(cartId);
      user.save();
      return user;
    } catch (e) {
      throw e;
    }
  };
}
