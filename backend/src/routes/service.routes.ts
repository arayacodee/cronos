import { Router } from "express";

import {
  createService,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/service.controller.js";

const router = Router();

router.post("/", createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.patch("/:id", updateService);

export default router;