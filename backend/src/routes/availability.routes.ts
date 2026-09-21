import { Router } from "express";
import {
  createAvailability,
  getAvailabilities,
  getAvailabilityById,
  deleteAvailability,
} from "../controllers/availability.controller.js";

const router = Router();

router.post("/", createAvailability);
router.get("/", getAvailabilities);
router.get("/:id", getAvailabilityById);
router.delete("/:id", deleteAvailability);

export default router;