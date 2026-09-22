import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Cloudinary se configura solo en el backend.
// Las credenciales privadas nunca se exponen a Angular.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };