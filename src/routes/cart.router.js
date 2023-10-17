import { Router } from "express";
import CartModel from "../DAO/mongoManager/models/cart.model.js";
import passport from "passport";

const router = Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const findCart = await CartModel.find();
    res.send(findCart);
  }
);
router.get(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;
    try {
      const cart = await CartModel.getCartById(cartId).populate("products");
      res.status(200).json({ status: "success", cart });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const result = await CartModel.create({ products: [] });
    res.send(result);
  }
);

//Add product to cart
router.post(
  "/:cid/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.query.quantity || 1;

    try {
      const cart = await CartModel.findById(cid);

      if (!cart) {
        return res.status(404).send({
          error: "Cart not found",
        });
      }

      cart.products.push({
        product_id: pid,
        quantity,
      });

      const result = await cart.save();

      res.send({ status: "success", payload: result });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Failed to add product in cart",
      });
    }
  }
);

router.put(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;
    const products = req.body.products;

    try {
      await CartModel.updateCart(cartId, products);
      res.status(200).json({ message: "Cart updated correctly" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart" });
    }
  }
);

router.put(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity);

    try {
      // Llamamos a la función asincrónica updateProductQuantity para actualizar la cantidad del producto en el carrito
      await CartModel.updateProductQuantity(cartId, productId, quantity);
      res
        .status(200)
        .json({ message: "Product quantity updated in cart correctly" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update product quantity in cart" });
    }
  }
);

router.delete(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
      await CartModel.removeProductFromCart(cartId, productId);
      res.status(200).json({ message: "Product deleted to cart correctly" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product of cart" });
    }
  }
);

router.delete(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;

    try {
      await CartModel.removeAllProductsFromCart(cartId);
      res.status(200).json({ message: "All products are deleted of cart" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete products of cart" });
    }
  }
);

export default router;
