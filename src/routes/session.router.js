import { Router } from "express";
import UserModel from "../DAO/mongoManager/models/user.model.js";
import passport from "passport";
import { createHash, isValidPassword } from "../utils.js";
import { generateToken } from "../utils.js";
import CartModel from "../DAO/mongoManager/models/cart.model.js";

const router = Router();

//Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (!user) return res.render("login", { error: "Usuario no encontrado" });
  if (!isValidPassword(user, password))
    return res.render("login", { error: "Contraseña incorrecta" });
  const access_token = generateToken(user);
  res
    .cookie("keyCookieForJWT", (user.token = access_token), {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    })
    .redirect("/profile");
});

router.post("/register", async (req, res) => {
  const user = req.body;
  const userDB = await UserModel.findOne({ email: user.email });
  if (userDB) return res.render("register", { error: "El usuario ya existe" });
  user.password = createHash(user.password);
  const cart = await CartModel.create({ products: [] });
  const UserCreate = await UserModel.create(req.body);
  UserCreate.cartId.push(cart._id);
  await UserModel.updateOne({ email: user.email }, UserCreate);
  res.redirect("/login");
});

//Deslogueo
router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie("keyCookieForJWT").redirect("/login");
  }
);

//Github
router.get(
  "/login-github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    console.log("Callback: ", req.user);
    const access_token = generateToken(req.user);
    res
      .cookie("keyCookieForJWT", (req.user.token = access_token), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      })
      .redirect("/profile");
  }
);

export default router;
