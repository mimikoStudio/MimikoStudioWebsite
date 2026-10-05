import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Folder, Image as ImageIcon } from 'lucide-react';
import { 
  getAllGalleryCategories, 
  createGalleryCategory, 
  updateGalleryCategory, 
  deleteGalleryCategory,
  getAllGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  GalleryCategory,
  GalleryImage 
} from '../../lib/contentService';
import { uploadImage, deleteImage, getStoragePathFromUrl, uploadMultipleImages } from '../../lib/storageService';

export default function GalleryManager() {
  const [activeTab, setActiveTab] = useState<'categories' | 'images'>('categories');
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'images') {
      loadImages();
    }
  }, [activeTab, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    const cats = await getAllGalleryCategories();
    setCategories(cats);
    setLoading(false);
  };

  const loadImages = async () => {
    const imgs = await getAllGalleryImages(selectedCategory === 'all' ? undefined : selectedCategory);
    setImages(imgs);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner-luxury" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">🖼️ Gallery Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 rounded-sm font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-gold text-white'
              : 'bg-pearl text-coffee/60 hover:bg-cream/50'
          }`}
        >
          <Folder size={16} className="inline mr-2" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-6 py-3 rounded-sm font-medium transition-all ${
            activeTab === 'images'
              ? 'bg-gold text-white'
              : 'bg-pearl text-coffee/60 hover:bg-cream/50'
          }`}
        >
          <ImageIcon size={16} className="inline mr-2" />
          Images ({images.length})
        </button>
      </div>

      {activeTab === 'categories' && (
        <GalleryCategoriesManager categories={categories} onRefresh={loadData} />
      )}

      {activeTab === 'images' && (
        <GalleryImagesManager
          categories={categories}
          images={images}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onRefresh={loadImages}
        />
      )}
    </div>
  );
}

// Gallery Categories Manager
function GalleryCategoriesManager({ categories, onRefresh }: { categories: GalleryCategory[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryCategory>>({
    name: '',
    slug: '',
    description: '',
    cover_image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadImage(file, 'gallery-covers');
    
    if (result.success && result.url) {
      setFormData(prev => ({ ...prev, cover_image_url: result.url }));
    } else {
      alert(`Upload failed: ${result.error}`);
    }
    
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Category name is required');
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    if (editingCategory) {
      const result = await updateGalleryCategory(editingCategory.id, { ...formData, slug });
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createGalleryCategory({ ...formData, slug });
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingCategory(null);
    resetForm();
    onRefresh();
  };

  const handleEdit = (category: GalleryCategory) => {
    setEditingCategory(category);
    setFormData(category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? All images in this category will also be deleted.')) return;

    const result = await deleteGalleryCategory(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    onRefresh();
  };

  const handleToggleActive = async (category: GalleryCategory) => {
    const result = await updateGalleryCategory(category.id, { is_active: !category.is_active });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    onRefresh();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      cover_image_url: '',
      display_order: categories.length,
      is_active: true,
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-pearl border rounded-sm p-6 ${
              category.is_active ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-heading text-lg text-chocolate">{category.name}</h3>
                <p className="text-xs text-coffee/50 font-mono">{category.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(category)}
                  className={`p-2 rounded-sm transition-colors ${
                    category.is_active
                      ? 'bg-sage/10 text-sage hover:bg-sage/20'
                      : 'bg-coffee/10 text-coffee hover:bg-coffee/20'
                  }`}
                >
                  {category.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                >
                  <Edit size={16} className="text-gold" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                >
                  <Trash2 size={16} className="text-blush" />
                </button>
              </div>
            </div>

            {category.cover_image_url && (
              <img
                src={category.cover_image_url}
                alt={category.name}
                className="w-full h-32 object-cover rounded-sm mb-4"
              />
            )}

            {category.description && (
              <p className="text-sm text-coffee/60 mb-4">{category.description}</p>
            )}

            <div className="text-xs text-coffee/50">
              Order: {category.display_order}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No gallery categories yet. Click "Add Category" to create one.</p>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: formData.slug || generateSlug(name)
                    });
                  }}
                  className="input-luxury"
                  placeholder="Wedding Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-luxury"
                  placeholder="wedding-collection"
                />
                <p className="text-xs text-coffee/50 mt-1">Auto-generated from name if empty</p>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="Beautiful wedding collection..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Cover Image
                </label>
                {formData.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={formData.cover_image_url}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-sm border border-beige/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const path = getStoragePathFromUrl(formData.cover_image_url || '');
                        if (path) deleteImage(path);
                        setFormData({ ...formData, cover_image_url: '' });
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-chocolate/80 hover:bg-chocolate text-ivory rounded-full flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-beige hover:border-gold rounded-sm p-8 text-center cursor-pointer transition-colors">
                      {uploading ? (
                        <div className="spinner-luxury mx-auto" />
                      ) : (
                        <>
                          <Upload size={24} className="mx-auto text-gold mb-2" />
                          <p className="text-xs text-coffee/60">Upload cover image</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="text-sm text-coffee/70">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Gallery Images Manager
function GalleryImagesManager({
  categories,
  images,
  selectedCategory,
  onCategoryChange,
  onRefresh,
}: {
  categories: GalleryCategory[];
  images: GalleryImage[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    category_id: categories[0]?.id || '',
    title: '',
    description: '',
    image_url: '',
    alt_text: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const categoryId = formData.category_id || categories[0]?.id;
    if (!categoryId) {
      alert('Please select a category first');
      setUploading(false);
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      alert('Category not found');
      setUploading(false);
      return;
    }

    const folder = `gallery/${category.slug}`;

    if (files.length === 1) {
      // Single file upload
      const result = await uploadImage(files[0], folder);
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, image_url: result.url }));
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } else {
      // Multiple file upload
      const results = await uploadMultipleImages(Array.from(files), folder);
      
      const successfulUploads = results.filter(r => r.success && r.url);
      
      if (successfulUploads.length > 0) {
        // Create gallery images for each successful upload
        for (let i = 0; i < successfulUploads.length; i++) {
          const result = successfulUploads[i];
          await createGalleryImage({
            category_id: categoryId,
            image_url: result.url!,
            title: `Image ${i + 1}`,
            display_order: images.length + i,
            is_active: true,
          });
        }
        
        alert(`Successfully uploaded ${successfulUploads.length} image(s)`);
        onRefresh();
      }
      
      if (results.some(r => !r.success)) {
        alert(`Some uploads failed. Check console for details.`);
      }
    }
    
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url || !formData.category_id) {
      alert('Image and category are required');
      return;
    }

    if (editingImage) {
      const result = await updateGalleryImage(editingImage.id, formData);
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createGalleryImage(formData);
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingImage(null);
    resetForm();
    onRefresh();
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData(image);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    const image = images.find(i => i.id === id);
    if (image) {
      const path = getStoragePathFromUrl(image.image_url);
      if (path) {
        await deleteImage(path);
      }
    }

    const result = await deleteGalleryImage(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    onRefresh();
  };

  const handleToggleActive = async (image: GalleryImage) => {
    const result = await updateGalleryImage(image.id, { is_active: !image.is_active });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    onRefresh();
  };

  const resetForm = () => {
    setFormData({
      category_id: selectedCategory === 'all' ? categories[0]?.id : selectedCategory,
      title: '',
      description: '',
      image_url: '',
      alt_text: '',
      display_order: images.length,
      is_featured: false,
      is_active: true,
    });
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="select-luxury"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingImage(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Upload Images
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`bg-pearl border rounded-sm overflow-hidden group ${
              image.is_active ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={image.alt_text || image.title || 'Gallery image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-chocolate/0 group-hover:bg-chocolate/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(image)}
                  className="p-2 bg-white rounded-full hover:bg-gold hover:text-white transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-white rounded-full hover:bg-blush hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {image.is_featured && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-gold text-white text-xs rounded-sm">
                  Featured
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => handleToggleActive(image)}
                  className={`p-1 rounded-sm transition-colors ${
                    image.is_active
                      ? 'text-sage hover:bg-sage/10'
                      : 'text-coffee/40 hover:bg-coffee/10'
                  }`}
                >
                  {image.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <span className="text-xs text-coffee/50">
                  {image.display_order}
                </span>
              </div>
              {image.title && (
                <p className="text-sm font-medium text-chocolate truncate">{image.title}</p>
              )}
              <p className="text-xs text-coffee/50 truncate">
                {image.category?.name || 'Unknown category'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No images yet. Click "Upload Images" to add some.</p>
        </div>
      )}

      {/* Image Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingImage ? 'Edit Image' : 'Upload Images'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingImage(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="select-luxury"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  {editingImage ? 'Image' : 'Upload Images'} *
                </label>
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-sm border border-beige/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const path = getStoragePathFromUrl(formData.image_url || '');
                        if (path) deleteImage(path);
                        setFormData({ ...formData, image_url: '' });
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-chocolate/80 hover:bg-chocolate text-ivory rounded-full flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-beige hover:border-gold rounded-sm p-12 text-center cursor-pointer transition-colors">
                      {uploading ? (
                        <div className="spinner-luxury mx-auto" />
                      ) : (
                        <>
                          <Upload size={32} className="mx-auto text-gold mb-2" />
                          <p className="text-sm text-coffee/70 mb-1">Click to upload or drag and drop</p>
                          <p className="text-xs text-coffee/50">PNG, JPG, WEBP up to 5MB each</p>
                          <p className="text-xs text-coffee/50 mt-2">You can select multiple files</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple={!editingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {formData.image_url && (
                <>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-luxury"
                      placeholder="Image title"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="textarea-luxury"
                      rows={3}
                      placeholder="Image description"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.alt_text || ''}
                      onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                      className="input-luxury"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="input-luxury"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                        Options
                      </label>
                      <div className="space-y-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="accent-gold"
                          />
                          <span className="text-sm text-coffee/70">Featured</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="accent-gold"
                          />
                          <span className="text-sm text-coffee/70">Active</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-beige/20">
                    <button type="submit" className="btn-primary flex-1">
                      {editingImage ? 'Update Image' : 'Save Image'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingImage(null);
                        resetForm();
                      }}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
