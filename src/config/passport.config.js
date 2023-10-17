import passport from "passport";
import local from "passport-local";
import userModel from "../DAO/mongoManager/models/user.model.js";
import GitHubStrategy from "passport-github2";
import { generateToken } from "../utils.js";
import jwt from "passport-jwt";
import cartModel from "../DAO/mongoManager/models/cart.model.js";

/*

App ID: 405493

Client ID: Iv1.f9814bc313e1f045

Secret: 0071e261345dc0af4c51cd62c46bef7f76dc8262

*/

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) =>
  req && req.cookies ? req.cookies["keyCookieForJWT"] : null;

const initializePassport = () => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: "secretForJWT",
      },
      async (jwtPayload, done) => {
        try {
          done(null, jwtPayload);
        } catch (error) {
          return done("Error to login with JWT" + error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.f9814bc313e1f045",
        clientSecret: "0071e261345dc0af4c51cd62c46bef7f76dc8262",
        callbackURL: "http://localhost:8080/api/session/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) {
            console.log("User already exists" + profile._json.email);
            const token = generateToken(user);
            user.token = token;
            console.log(user)
            return done(null, user);
          }
          const cart = await cartModel.create({ products: [] });
          const newUser = {
            first_name: profile._json.name,
            last_name: "",
            email: profile._json.email,
            age: 18,
            password: "",
            cartId: [cart._id],
            role: "user",
          };

          const access_token = generateToken(newUser);
          newUser.token = access_token;
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("Error to login with Github" + error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
