import mongoose from "mongoose";

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
    cartId: [
      {
        cid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "carts",
        },
      },
    ],
    role: {
      type: String,
      default: "user",
    },
  })
);

export default UserModel;
