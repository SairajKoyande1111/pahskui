import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

let configured = false;

function configure() {
  if (configured) return;
  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are required.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
}

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded asset.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  publicId: string,
): Promise<{ url: string; publicId: string }> {
  configure();

  const resourceType = mimeType.startsWith("image/") ? "image" : "raw";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          logger.error({ error }, "Cloudinary upload failed");
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}
