import { Router } from "express";
import ProductManager from "../DAO/fileManager/ProductManager.js";
import chatModel from "../DAO/mongoManager/models/chat.model.js";
import ProductModel from "../DAO/mongoManager/models/product.model.js";
import cartModel from "../DAO/mongoManager/models/cart.model.js";
import UserModel from "../DAO/mongoManager/models/user.model.js";
import passport from "passport";

const router = Router();
const productManager = new ProductManager();

router.get("/", (req, res) => {
  res.render("index", { css: "index" });
});

router.get("/home", async (req, res) => {
  const page = parseInt(req.query?.page || 1);
  const limit = parseInt(req.query?.limit || 15);
  const sort = req.query.sort || "asc";
  const queryParams = req.query?.query || "";
  const query = {};
  if (query) {
    const field = queryParams.split(",")[0];
    let value = queryParams.split(",")[1]; //con estos query puedo ir variando la paginacion segun atributos /list?limit=6&page=1&query=price,9000 (limite de productos por pagina, nª de pagina y entra por queryParam atributo y valor (field y value))

    if (!isNaN(parseInt(value))) value = parseInt(value);

    query[field] = value;
  }

  try {
    const result = await ProductModel.paginate(query, {
      page,
      limit,
      lean: true,
      sort,
    });
    console.log(result);
    res.render("home", { result, css: "home" });
  } catch (error) {
    res.status(500).json({ error: "Failed to get products" });
  }
});

router.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.user;
    const cart = await cartModel.findOne().lean().exec();
    const products = await ProductModel.find().lean().exec();
    res.render("products", { products, cart, user, css: "products" });
  }
);

router.get(
  "/cart/:cid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const cartId = req.params.cid;
    const cart = await cartModel
      .findById(cartId)
      .populate("products.product_id")
      .lean()
      .exec(); //http://127.0.0.1:8080/cart/650a4f6491b80838c779a495 debo pasar la ruta cart + el id del carrito que quiero consultar
    console.log(cart);
    res.render("cart", { cart, css: "cart" });
  }
);

router.get(
  "/realtimeproducts",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const products = await productManager.listProducts();
    res.render("realTimeProducts", { products, css: "realTimeProducts" });
  }
);

router.get(
  "/form_products",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res.render("form", { css: "form" });
  }
);

router.post(
  "/form_products",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const data = req.body;
    const newProduct = await productManager.createProduct(data);
    res.redirect("/home");
  }
);

//Ruta de Chat
router.get(
  "/chat",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const messages = await chatModel.find();
      res.render("chat", { messages, css: "chat" });
    } catch (error) {
      console.error("Failed to get messages", error);
      res.status(500).send("Failed to get messages from chat");
    }
  }
);

//Rutas de login, Register y Profile
router.get("/login", (req, res) => {
  if (req.session?.user) {
    res.redirect("/products");
  }

  res.render("login", {});
});

router.get("/register", (req, res) => {
  if (req.session?.user) {
    res.redirect("/profile");
  }

  res.render("register", {});
});

function auth(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { user } = req.user;
    console.log(user);
    res.render("profile", user);
  }
);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.send({ status: "Sucess", payload: req.user });
  }
);

export default router;
