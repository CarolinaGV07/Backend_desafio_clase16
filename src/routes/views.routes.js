import { Router } from "express";
import passport from "passport";
import { getProfile } from "../controllers/session.controllers.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", { css: "index" });
});

router.get("/failregister", async (req, res) => {
  res.send({ error: "failed" });
});

router.get("/register", (req, res) => {
  if (Object.keys(req.cookies)?.length != 0) return res.redirect("/profile");
  res.render("register", {css:"register"});
});
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getProfile
);

router.get("/login", (req, res) => {
  if (Object.keys(req.cookies).length != 0) return res.redirect("/profile");
  res.render("login", {css:"login"});
});



export default router;
