import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function ImageUpload({ 
  value = [], 
  onChange, 
  maxFiles = 5,
  maxSizeMB = 2
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  // Convert image to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        continue;
      }

      // Check if we've reached max files
      if (value.length + newImages.length >= maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        break;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (err) {
        setError('Failed to process image');
      }
    }

    // Add new images to existing ones
    onChange([...value, ...newImages]);

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
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-gold" />
                <p className="text-sm text-coffee/70">
                  Click to upload images
                </p>
                <p className="text-xs text-coffee/50">
                  PNG, JPG, WEBP up to {maxSizeMB}MB each
                </p>
                <p className="text-xs text-coffee/50">
                  {value.length} of {maxFiles} images uploaded
                </p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
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
        💡 Images are stored directly in the database (no storage buckets needed)
      </p>
    </div>
  );
}
