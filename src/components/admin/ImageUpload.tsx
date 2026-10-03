import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  maxFiles?: number;
}

export default function ImageUpload({ 
  value = [], 
  onChange, 
  bucket = 'product-images',
  maxFiles = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Add to existing images
      onChange([...value, publicUrl]);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check if we've reached max files
    if (value.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Upload each file
    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        continue;
      }

      await uploadImage(file);
    }

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-40 object-cover rounded-sm border border-beige/20"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-chocolate/80 hover:bg-chocolate text-ivory rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-gold text-chocolate text-xs rounded-sm">
                  Main Image
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {value.length < maxFiles && (
        <div>
          <label className="block">
            <div className="border-2 border-dashed border-beige hover:border-gold rounded-sm p-8 text-center cursor-pointer transition-colors">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="spinner-luxury" />
                  <p className="text-sm text-coffee/60">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-gold" />
                  <p className="text-sm text-coffee/70">
                    Click to upload images
                  </p>
                  <p className="text-xs text-coffee/50">
                    PNG, JPG, WEBP up to 5MB each
                  </p>
                  <p className="text-xs text-coffee/50">
                    {value.length} of {maxFiles} images uploaded
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-blush/10 border border-blush/20 rounded-sm text-sm text-blush">
          {error}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-coffee/50">
        💡 Tip: The first image will be used as the main product image. Upload multiple images to showcase different angles.
      </p>
    </div>
  );
}
