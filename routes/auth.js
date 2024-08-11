import express from 'express';
import paths from './paths.js';
import config from '../config.js';
import guestGuard from '../middleware/guestGuard.js';
import User from '../models/User.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get(paths.auth.signIn, guestGuard, (req, res) => {
  res.render('auth/sign-in', {
    layout: 'auth',
    title: 'Sign in',
  });
});

router.post(paths.auth.signIn, guestGuard, async (req, res) => {
  const {email, password} = req.body;
  const user = await User.query().findOne({email});

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.redirect(`${paths.auth.signIn}?invalid-credentials`);
  }

  const accessToken = jwt.sign({id: user.id}, config.JWT_SECRET, {expiresIn: '1h'});

  res.cookie('accessToken', accessToken, {
    domain: config.COOKIES_DOMAIN,
    httpOnly: config.COOKIES_HTTPONLY,
    secure: config.COOKIES_SECURE,
    sameSite: config.COOKIES_SAMESITE,
    maxAge: config.COOKIES_MAXAGE
  });

  res.redirect(paths.app.index);
});

export default router;