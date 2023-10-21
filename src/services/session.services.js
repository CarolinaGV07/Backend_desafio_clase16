import { createHash, isValidPassword } from "../utils.js";
import UserDTO from "../DTO/user.dto.js";

export default class SessionServices {
  constructor(userDAO, cartDAO) {
    this.userDAO = userDAO;
    this.cartDAO = cartDAO;
  }

  async loginUser(user) {
    try {
      const userDB = await this.userDAO.getUserByEmail(user.email);
      if (!userDB) {
        throw new Error("User not found");
      }
      if (userDB.status === "not verified") {
        throw new Error("User not verified");
      }
      if (!isValidPassword(userDB, user.password)) {
        throw new Error("Password not valid");
      }
      return new UserDTO(userDB);
    } catch (e) {
      throw e;
    }
  }

  async registerUser(user) {
    if (await this.userDAO.getUserByEmail(user.email))
      throw new Error("User already exist");
    user.password = createHash(user.password);
    if (user.email === "adminCoder@coder.com") {
      user.rol = "admin";
    } else {
      user.rol = "user";
    }
    const cart = await this.cartDAO.createCart();
    const newUser = await this.userDAO.createUser(user);
    newUser.cartId.push(cart._id);
    await this.userDAO.updateUser(newUser._id, newUser);
    return newUser;
  }

  async getUserCurrent(user) {
    return new UserDTO(user);
  }

  async getUserByEmail(email) {
    try {
      const user = await this.userDAO.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (e) {
      throw e;
    }
  }
}
