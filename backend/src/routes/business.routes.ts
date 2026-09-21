import { Router } from "express";
import {
  createBusiness,
  getBusinessById,
  getBusinesses,
} from "../controllers/business.controller.js";

const router = Router();

router.post("/", createBusiness);
router.get("/", getBusinesses);
router.get("/:id", getBusinessById);

export default router;