
import sharp from 'sharp';

export async function convertToWebP(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Converting image to WebP format...');
    
    return sharp(imageBuffer)
      .webp({ 
        quality: 80,  // Adjust quality as needed (0-100)
        lossless: false, // Use lossy compression for smaller files
        effort: 6  // Compression effort (0-6), higher means slower but better compression
      })
      .toBuffer();
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    throw error;
  }
}

export async function optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Image metadata:', metadata);
    
    let sharpInstance = sharp(imageBuffer);
    
    // Resize if the image is too large (e.g., over 1200px wide)
    if (metadata.width && metadata.width > 1200) {
      console.log('Resizing large image...');
      sharpInstance = sharpInstance.resize({
        width: 1200,
        withoutEnlargement: true
      });
    }
    
    // Convert to WebP
    return sharpInstance
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}
