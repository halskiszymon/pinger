import config from '../config.js';
import paths from '../routes/paths.js';
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authGuard = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (accessToken == null) {
    return res.redirect(paths.auth.signIn);
  }

  jwt.verify(accessToken, config.JWT_SECRET, async (error, {id}) => {
    if (error) {
      return res.redirect(paths.auth.signIn);
    }

    req.user = await User.query().findById(id);

    next();
  });
}

export default authGuard;