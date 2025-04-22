
import sharp from 'sharp';

export async function convertToWebP(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .webp({ quality: 80 }) // Adjust quality as needed
    .toBuffer();
}
