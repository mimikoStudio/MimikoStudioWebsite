import { supabase } from '../lib/supabase';

// ============================================
// AUTO-CREATE STORAGE BUCKETS
// Call this on admin dashboard load
// ============================================
export async function ensureStorageBuckets() {
  const buckets = [
    { name: 'product-images', public: true },
    { name: 'gallery-images', public: true },
    { name: 'inquiry-references', public: false },
    { name: 'customer-uploads', public: false },
  ];

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const bucket of buckets) {
    try {
      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      });

      if (error) {
        if (error.message.includes('already exists')) {
          results.push({ name: bucket.name, success: true });
        } else {
          results.push({ name: bucket.name, success: false, error: error.message });
        }
      } else {
        results.push({ name: bucket.name, success: true });
      }
    } catch (err: any) {
      results.push({ name: bucket.name, success: false, error: err.message });
    }
  }

  return results;
}

// ============================================
// UPLOAD IMAGE TO STORAGE
// ============================================
export async function uploadProductImage(file: File, productId?: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId || 'products'}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err: any) {
    console.error('Upload exception:', err);
    return null;
  }
}

// ============================================
// CHECK IF BUCKETS EXIST
// ============================================
export async function checkStorageBuckets(): Promise<{ exists: boolean; missing: string[] }> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { exists: false, missing: ['product-images', 'gallery-images', 'inquiry-references', 'customer-uploads'] };
    }

    const bucketNames = buckets?.map((b: any) => b.name) || [];
    const required = ['product-images', 'gallery-images', 'inquiry-references', 'customer-uploads'];
    const missing = required.filter(name => !bucketNames.includes(name));

    return { exists: missing.length === 0, missing };
  } catch {
    return { exists: false, missing: ['product-images', 'gallery-images', 'inquiry-references', 'customer-uploads'] };
  }
}
