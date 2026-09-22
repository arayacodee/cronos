import { Router } from "express";

import {
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation,
} from "../controllers/reservation.controller.js";

import {
  authenticate,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getReservations
);

router.get(
  "/:id",
  getReservationById
);

router.post(
  "/",
  requireRole("CLIENT"),
  createReservation
);

router.patch(
  "/:id/cancel",
  cancelReservation
);

export default router;