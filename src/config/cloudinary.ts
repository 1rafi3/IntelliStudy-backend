import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from '@shared/utils/logger';

// ─── Cloudinary Singleton ─────────────────────────────────────────────────────
// Configured once at startup. Import `cloudinaryClient` anywhere in the app
// to use the pre-configured Cloudinary instance.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryClient = cloudinary;

// ─── Verify Connection ────────────────────────────────────────────────────────
export const verifyCloudinary = async (): Promise<void> => {
  try {
    await cloudinary.api.ping();
    logger.info('✅ Cloudinary connected');
  } catch (error) {
    logger.error('❌ Cloudinary connection failed:', error);
    // Non-fatal — app can still run without Cloudinary at startup
  }
};
