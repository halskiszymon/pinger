import config from '../config.js';
import paths from '../routes/paths.js';
import jwt from "jsonwebtoken";

const guestGuard = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    next();
  } else {
    jwt.verify(accessToken, config.JWT_SECRET, (error, user) => {
      if (error || typeof user === 'undefined' || !!user) {
        next();
      }

      return res.redirect(paths.app.index);
    });
  }
}

export default guestGuard;