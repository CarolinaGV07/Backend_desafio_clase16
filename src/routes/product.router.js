import { Router } from "express";
import ProductModel from "../DAO/mongoManager/models/product.model.js";
import passport from "passport";

const router = Router();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit);
  const products = await ProductModel.find().lean().exec();
  if (limit) {
    const limitProds = products.slice(0, limit);
    res.send(limitProds);
  } else {
    res.send(products);
  }
});

router.get(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = parseInt(req.params.pid);
    const productFounded = await ProductModel.findById(id);

    if (!productFounded) res.status(404).send({ error: "Product not found" });
    else res.send(productFounded);
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const data = req.body;
    const newProduct = await ProductModel.create(data);
    res.send(newProduct);
  }
);

router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const pid = parseInt(req.params.pid);
    const productUpdated = await ProductModel.updateOne(pid);
    res.send(productUpdated);
  }
);

router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = await ProductModel.delete(pid);
    res.send(id);
  }
);
export default router;
