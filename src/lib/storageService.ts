import { supabase } from './supabase';

const BUCKET_NAME = 'website-content';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
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

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
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
