import { supabase } from './supabase';

const PREFERRED_BUCKET = 'website-content';
const FALLBACK_BUCKET = 'product-images';

/**
 * Convert file to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Try to upload to a specific bucket
 */
async function tryUploadToBucket(
  bucketName: string,
  filePath: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Upload image with automatic fallback
 * Tries: website-content → product-images → base64
 */
export async function uploadImage(
  file: File,
  folder: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string; method?: string }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB.' };
    }

    // Generate file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}-${randomString}.${extension}`;
    const filePath = `${folder}/${finalFileName}`;

    // Try preferred bucket first
    console.log(`📤 Trying upload to ${PREFERRED_BUCKET}...`);
    const result1 = await tryUploadToBucket(PREFERRED_BUCKET, filePath, file);
    
    if (result1.success) {
      console.log(`✅ Uploaded to ${PREFERRED_BUCKET}`);
      return { ...result1, path: filePath, method: 'storage' };
    }

    // If preferred bucket fails, try fallback bucket
    console.log(`⚠️ ${PREFERRED_BUCKET} failed, trying ${FALLBACK_BUCKET}...`);
    const result2 = await tryUploadToBucket(FALLBACK_BUCKET, filePath, file);
    
    if (result2.success) {
      console.log(`✅ Uploaded to ${FALLBACK_BUCKET}`);
      return { ...result2, path: filePath, method: 'storage' };
    }

    // If both buckets fail, convert to base64
    console.log(`⚠️ Both buckets failed, converting to base64...`);
    const base64 = await fileToBase64(file);
    console.log(`✅ Converted to base64 (${base64.length} chars)`);
    
    return {
      success: true,
      url: base64,
      method: 'base64',
    };
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    
    // Last resort: try base64 conversion
    try {
      const base64 = await fileToBase64(file);
      return {
        success: true,
        url: base64,
        method: 'base64',
      };
    } catch (base64Error: any) {
      return { success: false, error: base64Error.message || 'Upload failed' };
    }
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Try preferred bucket first
    const { error: error1 } = await supabase.storage
      .from(PREFERRED_BUCKET)
      .remove([path]);

    if (!error1) {
      return { success: true };
    }

    // Try fallback bucket
    const { error: error2 } = await supabase.storage
      .from(FALLBACK_BUCKET)
      .remove([path]);

    if (!error2) {
      return { success: true };
    }

    return { success: false, error: error2?.message || 'Delete failed' };
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message || 'Delete failed' };
  }
}

/**
 * Replace image in Supabase Storage
 */
export async function replaceImage(
  oldPath: string,
  newFile: File,
  folder: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    // Delete old image
    if (oldPath) {
      await deleteImage(oldPath);
    }

    // Upload new image
    return await uploadImage(newFile, folder);
  } catch (error: any) {
    console.error('Error replacing image:', error);
    return { success: false, error: error.message || 'Replace failed' };
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string
): Promise<Array<{ success: boolean; url?: string; path?: string; error?: string }>> {
  const results = [];
  
  for (const file of files) {
    const result = await uploadImage(file, folder);
    results.push(result);
  }

  return results;
}

/**
 * Get storage path from URL
 */
export function getStoragePathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
