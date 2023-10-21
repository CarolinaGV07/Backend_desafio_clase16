import CartDTO from "../DTO/carts.dto.js";
import mongoose from "mongoose";
import { v4 } from "uuid";
import moment from "moment";

export default class CartRepository {
  constructor(cartDAO, userDAO, productDAO, ticketDAO) {
    this.cartDAO = cartDAO;
    this.userDAO = userDAO;
    this.productDAO = productDAO;
    this.ticketDAO = ticketDAO;
  }
  async createCart() {
    try {
      const cart = await this.cartDAO.createCart();
      return cart
    } catch (error) {
      throw error;
    }
  }
  async getCartById(id) {
    try {
      const cart = await this.cartDAO.getCartById(id);
      return new CartDTO(cart);
    } catch (error) {
      throw error;
    }
  }
  async updateCartById(id, data) {
    try {
      const cart = await this.cartDAO.updateCartById(id, data);
      return cart();
    } catch (error) {
      throw error;
    }
  }
  async deleteCartById(id) {
    try {
      const cart = await this.cartDAO.deleteCartById(id);
      return new CartDTO(cart);
    } catch (error) {
      throw error;
    }
  }
  async addProductCartByID(pid, quantity, user) {
    try {
      const userBD = await this.userDAO.getUserByEmail(user.email);
      let cartId = userBD.cartId[0];
      let cart;
      if (cartId) {
        cart = await this.cartDAO.getCartById(cartId);
      } else {
        cart = await this.cartDAO.createCart();
        userBD.cartId.push(cart._id);
        await this.userDAO.updateUser(userBD._id, userBD);
        cartId = cart._id;
      }
      const product = await this.productDAO.getProductById(pid);
      const productValidate = cart.products?.find(
        (product) => product.pid._id.toString() == pid.toString()
      );
      if (productValidate) {
        if (product.stock < quantity) {
          throw new Error("Stock not available");
        }
        product.stock -= quantity;
        productValidate.quantity += quantity;
      } else {
        if (product.stock >= quantity) {
          product.stock -= quantity;
          cart.products.push({ pid, quantity });
          await this.cartDAO.updateCartById(cartId, cart);
        } else {
          throw new Error("Stock not available");
        }
      }
      await this.cartDAO.updateCartById(cartId, cart);
      await this.productDAO.updateProduct(pid, product);
      return cart;
    } catch (error) {
      throw error;
    }
  }
  async deleteProductCartById(cid, pid) {
    try {
      const cartId = cid.toString();
      let cart = await this.cartDAO.getCartById(cartId);
      if (cart) {
        const productValidate = cart.products.find(
          (product) => product.pid.toString() == pid.toString()
        );
        if (productValidate) {
          await this.cartDao.updateCartById(
            { _id: cid },
            { $pull: { products: { pid: pid } } }
          );
          await cart.save();
          return cart;
        }
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }
  async clearCart(cid, pid) {
    try {
      const cart = await this.cartDAO.getCartById(cid);
      const products = cart.products;
      const updatedProducts = products.filter(
        (product) => product.pid._id.toString() !== pid.toString()
      );
      cart.products = updatedProducts;
      return cart; // Devuelve la instancia de carrito modificada
    } catch (error) {
      throw error;
    }
  }

  async deleteProductOneCartById(user, pid) {
    const userBD = await this.userDAO.getUserByEmail(user.email);
    let cart = await this.cartDAO.getCartById(userBD.cartId[0]._id);
    const product = await this.productDAO.getProductById(pid);
    if (cart) {
      const productValidate = cart.products.find(
        (product) => product.pid._id == pid
      );
      if (productValidate) {
        productValidate.quantity -= 1;
        product.stock += 1;
        if (productValidate.quantity == 0) {
          cart = await this.clearCart(
            userBD.cartId[0]._id,
            productValidate.pid._id
          );
          await this.cartDAO.updateCartById(userBD.cartId[0]._id, cart);
        }
        await this.cartDAO.updateCartById(userBD.cartId[0]._id, cart);
        await this.productDAO.updateProduct(pid, product);
        return cart;
      }
      return null;
    } else {
      return null;
    }
  }
  async deleteProductsCart(cid) {
    try {
      const cart = await this.cartDAO.getCartById(cid);
      if (!cart) return null;
      await this.cartDAO.updateCartById(id, { product: [] });
      await cart.save();
    } catch (error) {
      throw error;
    }
  }
  async updateProductCartById(cid, pid, quantity) {
    try {
      let cart = await this.cartDAO.getCartById(cid);
      const product = cart.products.find((product) => {
        product.pid._id.toString() == pid.toString();
      });
      if (!product) {
        cart.products.push({ pid, quantity });
      }
      product.quantity = quantity;
      await this.cartDAO.updateCartById(cid, cart);
      return new cart();
    } catch (error) {
      throw error;
    }
  }

  async getCartUserById(user) {
    try {
      const userBD = await this.userDAO.getUserByEmail(user.email);
      let cart = userBD.cartId[0];
      if (!cart) {
        throw new Error("Cart not found");
      }
      const cartID = new mongoose.Types.ObjectId(cart);
      cart = await this.cartDAO.getCartById(cartID);
      let total = 0;
      cart.products.forEach((product) => {
        const subtotal = product.pid.price * product.quantity;
        product.total = subtotal;
        total = total + subtotal;
      });
      return { cart, total };
    } catch (error) {
      throw error;
    }
  }

  async getTicketCartUserById(user) {
    const { cart, total } = await this.getCartUserById(user);
    if (cart.products.length !== 0) {
      const products = { products: [] };
      await this.cartDAO.updateCartById(cart._id, products);
      const ticket = {
        code: v4(),
        purchase_datetime: new moment()
          .format("YYYY-MM-DD HH:mm:ss")
          .toString(),
        amount: total,
        purcharser: user.email,
      };
      await this.ticketDAO.addTicket(ticket);
      return ticket;
    } else {
      throw new Error("Cart is empty");
    }
  }
}
