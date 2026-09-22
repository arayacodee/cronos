import { Router } from "express";

import {
  createService,
  getServices,
  getServiceById,
  updateService,
} from "../controllers/service.controller.js";

import {
  authenticate,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  getServices
);

router.get(
  "/:id",
  getServiceById
);

router.post(
  "/",
  authenticate,
  requireRole("PROFESSIONAL"),
  createService
);

router.patch(
  "/:id",
  authenticate,
  requireRole("PROFESSIONAL"),
  updateService
);

export default router;