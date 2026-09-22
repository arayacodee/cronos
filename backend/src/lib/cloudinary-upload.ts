import type {
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

import { cloudinary } from "./cloudinary.js";

// Cloudinary trabaja con streams.
// Este helper permite enviar directamente el Buffer de Multer.
export const uploadImageBuffer = (
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> => {
  return new Promise(
    (resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error(
                  "Cloudinary returned no upload result"
                )
              );

              return;
            }

            resolve(result);
          }
        );

      stream.end(buffer);
    }
  );
};