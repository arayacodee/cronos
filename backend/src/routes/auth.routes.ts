import { Router } from "express";

import {
  googleLogin,
  getCurrentUser,
  logout
} from "../controllers/auth.controller.js";

import {
  authenticate
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/google",
  googleLogin
);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

router.post(
  "/logout",
  logout
);

export default router;