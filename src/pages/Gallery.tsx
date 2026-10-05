import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getActiveGalleryCategories, getActiveGalleryImages, GalleryCategory, GalleryImage } from '../lib/contentService';

export default function Gallery() {
  const { slug } = useParams<{ slug?: string }>();
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (slug) {
      setSelectedCategory(slug);
    }
  }, [slug]);

  useEffect(() => {
    loadImages();
  }, [selectedCategory]);

  const loadCategories = async () => {
    setLoading(true);
    const data = await getActiveGalleryCategories();
    setCategories(data);
    setLoading(false);
  };

  const loadImages = async () => {
    const categoryId = selectedCategory === 'all' ? undefined : selectedCategory;
    const data = await getActiveGalleryImages(categoryId);
    setImages(data);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const goToPreviousImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="spinner-luxury" />
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">📸 Portfolio</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">
            Gallery
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            A showcase of our handcrafted creations — each piece unique, each story beautiful.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-12 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-6 py-3 rounded-sm text-sm font-label tracking-wider uppercase transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gold text-white'
                  : 'bg-pearl text-coffee/60 hover:bg-cream/50 border border-beige/20'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-sm text-sm font-label tracking-wider uppercase transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gold text-white'
                    : 'bg-pearl text-coffee/60 hover:bg-cream/50 border border-beige/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Images Grid */}
          {images.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="relative overflow-hidden rounded-sm bg-pearl border border-beige/20">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.title || 'Gallery image'}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolate/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {image.title && (
                          <h3 className="font-heading text-lg text-ivory mb-1">
                            {image.title}
                          </h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-ivory/80 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {image.is_featured && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gold text-white text-xs rounded-sm">
                        Featured
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🖼️</span>
              <p className="text-coffee/40 text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-chocolate/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-ivory/10 hover:bg-ivory/20 rounded-full flex items-center justify-center text-ivory transition-all"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 hover:bg-ivory/20 rounded-full flex items-center justify-center text-ivory transition-all"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory/10 hover:bg-ivory/20 rounded-full flex items-center justify-center text-ivory transition-all"
              >
                →
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.alt_text || selectedImage.title || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="mt-4 text-center max-w-2xl">
                {selectedImage.title && (
                  <h3 className="font-heading text-2xl text-ivory mb-2">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-ivory/80">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
