import { Router } from "express";

import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  getMyBusiness,
  updateMyBusiness,
  updateBusinessAvatar,
  updateBusinessCover,
} from "../controllers/business.controller.js";

import {
  authenticate,
  requireRole,
} from "../middleware/auth.middleware.js";

import {
  uploadBusinessImage,
} from "../middleware/upload.middleware.js";

const router = Router();


// Rutas públicas
router.get(
  "/",
  getBusinesses
);


// Rutas del profesional autenticado.
// /me debe declararse antes de /:id.
router.get(
  "/me",
  authenticate,
  requireRole("PROFESSIONAL"),
  getMyBusiness
);

router.patch(
  "/me",
  authenticate,
  requireRole("PROFESSIONAL"),
  updateMyBusiness
);


// Avatar del negocio
router.put(
  "/me/avatar",
  authenticate,
  requireRole("PROFESSIONAL"),
  uploadBusinessImage,
  updateBusinessAvatar
);


// Portada del negocio
router.put(
  "/me/cover",
  authenticate,
  requireRole("PROFESSIONAL"),
  uploadBusinessImage,
  updateBusinessCover
);


// Perfil público por ID
router.get(
  "/:id",
  getBusinessById
);


// Crear perfil profesional
router.post(
  "/",
  authenticate,
  requireRole("PROFESSIONAL"),
  createBusiness
);

export default router;