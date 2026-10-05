import { supabase } from '../lib/supabase';

/**
 * Get public URL for an image from Supabase Storage
 * Handles both full URLs and storage paths
 */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // If it's already a full URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a data URL (base64), return as-is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's a storage path, get public URL
  try {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imageUrl);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
}

/**
 * Get image URL with fallback
 */
export function getImageUrlWithFallback(
  imageUrl: string | null | undefined,
  fallback: string = '/placeholder-image.svg'
): string {
  const url = getImageUrl(imageUrl);
  return url || fallback;
}

/**
 * Check if an image URL is valid and accessible
 */
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;

  // Data URLs are always valid
  if (imageUrl.startsWith('data:')) {
    return true;
  }

  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Create a placeholder SVG data URL
 */
export function createPlaceholderSvg(
  width: number = 400,
  height: number = 400,
  text: string = 'No Image'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F5F5F5"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" fill="#999">
        ${text}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
