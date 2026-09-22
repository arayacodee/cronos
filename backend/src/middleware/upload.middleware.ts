import multer from "multer";
import type { RequestHandler } from "express";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const imageUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new Error(
          "Only JPEG, PNG and WebP images are allowed"
        )
      );

      return;
    }

    callback(null, true);
  },
});

// La imagen se mantiene temporalmente en memoria.
// También devolvemos errores JSON claros antes del controller.
export const uploadBusinessImage: RequestHandler = (
  req,
  res,
  next
) => {
  imageUpload.single("image")(
    req,
    res,
    (error) => {
      if (!error) {
        next();
        return;
      }

      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        res.status(413).json({
          error: "Image must not exceed 5 MB",
        });

        return;
      }

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Invalid image",
      });
    }
  );
};