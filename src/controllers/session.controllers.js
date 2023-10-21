import { sessionService } from "../services/index.js";
import { generateToken } from "../utils.js";
import jwt from "jsonwebtoken";
import Swal from "sweetalert2";

export const loginUser = async (req, res) => {
  try {
    const user = await sessionService.loginUser(req.body);
    if (user == null) {
      return res.redirect("/login");
    }
    const access_token = generateToken(user);
    res
      .cookie("keyCookieForJWT", (user.token = access_token), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      })
      .render("profile", user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const user = await sessionService.registerUser(req.body);
    res.redirect("/api/session/login");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCurrent = async (req, res) => {
  try {
    const user = await sessionService.getUserCurrent(req.user.user);
    req.logger.info("Usuario obtenido");
    return res.send({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verificarUser = async (req, res) => {
  try {
    const token = req.params.token;
    jwt.verify(token, "secret", async (err, decoded) => {
      if (err) {
        req.logger.fatal("Token de verificacion no válido");
        res.status(500).json({ message: "Token de verificacion no válido" });
      }
      await sessionService.verificarUser(decoded);
      res.render("verificar", {});
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  const { user } = req.user;
  const userDB = await sessionService.getUserByEmail(user.email);
  console.log(userDB);
  res.status(200).render("profile", userDB);
};
