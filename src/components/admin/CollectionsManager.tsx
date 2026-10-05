import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { getAllCollections, createCollection, updateCollection, deleteCollection, Collection } from '../../lib/contentService';
import { uploadImage, deleteImage, getStoragePathFromUrl } from '../../lib/storageService';

export default function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Collection>>({
    name: '',
    slug: '',
    short_description: '',
    long_description: '',
    cover_image_url: '',
    background_image_url: '',
    button_text: '',
    button_url: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const data = await getAllCollections();
    setCollections(data);
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const folder = type === 'cover' ? 'collections/covers' : 'collections/backgrounds';
    const result = await uploadImage(file, folder);
    
    if (result.success && result.url) {
      setFormData(prev => ({
        ...prev,
        [`${type}_image_url`]: result.url,
      }));
    } else {
      alert(`Upload failed: ${result.error}`);
    }
    
    setUploading(false);
  };

  const handleRemoveImage = async (type: 'cover' | 'background') => {
    const url = formData[`${type}_image_url`];
    if (!url) return;

    if (!confirm('Remove this image?')) return;

    const path = getStoragePathFromUrl(url);
    if (path) {
      await deleteImage(path);
    }

    setFormData(prev => ({
      ...prev,
      [`${type}_image_url`]: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Collection name is required');
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    if (editingCollection) {
      const result = await updateCollection(editingCollection.id, { ...formData, slug });
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createCollection({ ...formData, slug });
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingCollection(null);
    resetForm();
    loadCollections();
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData(collection);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? This cannot be undone.')) return;

    const collection = collections.find(c => c.id === id);
    if (collection) {
      // Delete images from storage
      if (collection.cover_image_url) {
        const path = getStoragePathFromUrl(collection.cover_image_url);
        if (path) await deleteImage(path);
      }
      if (collection.background_image_url) {
        const path = getStoragePathFromUrl(collection.background_image_url);
        if (path) await deleteImage(path);
      }
    }

    const result = await deleteCollection(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    loadCollections();
  };

  const handleToggleActive = async (collection: Collection) => {
    const result = await updateCollection(collection.id, { is_active: !collection.is_active });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    loadCollections();
  };

  const handleToggleFeatured = async (collection: Collection) => {
    const result = await updateCollection(collection.id, { is_featured: !collection.is_featured });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    loadCollections();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      long_description: '',
      cover_image_url: '',
      background_image_url: '',
      button_text: '',
      button_url: '',
      display_order: collections.length,
      is_featured: false,
      is_active: true,
      seo_title: '',
      seo_description: '',
    });
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
        <h2 className="text-2xl font-heading text-chocolate">💎 Signature Collections</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCollection(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`bg-pearl border rounded-sm overflow-hidden ${
              collection.is_active ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            {/* Cover Image */}
            <div className="aspect-video relative">
              {collection.cover_image_url ? (
                <img
                  src={collection.cover_image_url}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cream/30 flex items-center justify-center text-4xl">
                  💎
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {collection.is_featured && (
                  <span className="px-2 py-1 bg-gold text-white text-xs rounded-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Collection Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-chocolate">{collection.name}</h3>
                  <p className="text-xs text-coffee/50 font-mono">{collection.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(collection)}
                    className={`p-2 rounded-sm transition-colors ${
                      collection.is_active
                        ? 'bg-sage/10 text-sage hover:bg-sage/20'
                        : 'bg-coffee/10 text-coffee hover:bg-coffee/20'
                    }`}
                    title={collection.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {collection.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(collection)}
                    className={`p-2 rounded-sm transition-colors ${
                      collection.is_featured
                        ? 'bg-gold/10 text-gold hover:bg-gold/20'
                        : 'bg-coffee/10 text-coffee/40 hover:bg-coffee/20'
                    }`}
                    title={collection.is_featured ? 'Unfeature' : 'Feature'}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleEdit(collection)}
                    className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} className="text-gold" />
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-blush" />
                  </button>
                </div>
              </div>

              {collection.short_description && (
                <p className="text-sm text-coffee/60 mb-4 line-clamp-2">
                  {collection.short_description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-coffee/50">Order</p>
                  <p className="text-chocolate font-medium">{collection.display_order}</p>
                </div>
                <div>
                  <p className="text-coffee/50">Status</p>
                  <p className={collection.is_active ? 'text-sage' : 'text-coffee/40'}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {collection.button_text && (
                <div className="mt-4 pt-4 border-t border-beige/20">
                  <p className="text-xs text-coffee/50 mb-1">Button</p>
                  <p className="text-sm text-chocolate">
                    {collection.button_text} → {collection.button_url || 'No URL'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No collections yet. Click "Add Collection" to create one.</p>
        </div>
      )}

      {/* Collection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingCollection ? 'Edit Collection' : 'Add New Collection'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCollection(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Collection Name *
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
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={formData.short_description || ''}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="input-luxury"
                      placeholder="Brief description for cards"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Long Description
                    </label>
                    <textarea
                      value={formData.long_description || ''}
                      onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                      className="textarea-luxury"
                      rows={4}
                      placeholder="Detailed description for collection page"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Images
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Cover Image */}
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
                          onClick={() => handleRemoveImage('cover')}
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
                          onChange={(e) => handleImageUpload(e, 'cover')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Background Image
                    </label>
                    {formData.background_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.background_image_url}
                          alt="Background preview"
                          className="w-full h-48 object-cover rounded-sm border border-beige/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('background')}
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
                              <p className="text-xs text-coffee/60">Upload background</p>
                              <p className="text-xs text-coffee/40">Optional</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'background')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Button */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Call to Action
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.button_text || ''}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      className="input-luxury"
                      placeholder="View Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={formData.button_url || ''}
                      onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                      className="input-luxury"
                      placeholder="/collections/wedding"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  SEO (Optional)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title || ''}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      className="input-luxury"
                      placeholder="Wedding Collection | Mimiko Studio"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seo_description || ''}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      className="textarea-luxury"
                      rows={2}
                      placeholder="Discover our beautiful wedding collection..."
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Settings
                </h4>
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
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingCollection ? 'Update Collection' : 'Create Collection'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCollection(null);
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
