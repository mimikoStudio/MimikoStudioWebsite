import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';
import { getAllHeroBanners, createHeroBanner, updateHeroBanner, deleteHeroBanner, HeroBanner } from '../../lib/contentService';
import { uploadImage, deleteImage, getStoragePathFromUrl } from '../../lib/storageService';

export default function HeroBannerManager() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    button_url: '',
    desktop_image_url: '',
    mobile_image_url: '',
    tablet_image_url: '',
    display_order: 0,
    duration: 5000,
    transition_type: 'fade',
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const data = await getAllHeroBanners();
    setBanners(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile' | 'tablet') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadImage(file, 'hero-banners');
    
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

  const handleRemoveImage = async (type: 'desktop' | 'mobile' | 'tablet') => {
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

    if (!formData.title || !formData.desktop_image_url) {
      alert('Title and desktop image are required');
      return;
    }

    if (editingBanner) {
      const result = await updateHeroBanner(editingBanner.id, formData);
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createHeroBanner(formData);
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingBanner(null);
    resetForm();
    loadBanners();
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return;

    const banner = banners.find(b => b.id === id);
    if (banner) {
      // Delete images from storage
      if (banner.desktop_image_url) {
        const path = getStoragePathFromUrl(banner.desktop_image_url);
        if (path) await deleteImage(path);
      }
      if (banner.mobile_image_url) {
        const path = getStoragePathFromUrl(banner.mobile_image_url);
        if (path) await deleteImage(path);
      }
      if (banner.tablet_image_url) {
        const path = getStoragePathFromUrl(banner.tablet_image_url);
        if (path) await deleteImage(path);
      }
    }

    const result = await deleteHeroBanner(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    loadBanners();
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    const result = await updateHeroBanner(banner.id, { is_active: !banner.is_active });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    loadBanners();
  };

  const handleReorder = async (banner: HeroBanner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === banners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swappedBanner = banners[newIndex];

    await updateHeroBanner(banner.id, { display_order: swappedBanner.display_order });
    await updateHeroBanner(swappedBanner.id, { display_order: banner.display_order });
    
    loadBanners();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      button_text: '',
      button_url: '',
      desktop_image_url: '',
      mobile_image_url: '',
      tablet_image_url: '',
      display_order: banners.length,
      duration: 5000,
      transition_type: 'fade',
      is_active: true,
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
        <h2 className="text-2xl font-heading text-chocolate">🎨 Hero Banners</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBanner(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`bg-pearl border rounded-sm p-6 ${
              banner.is_active ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            <div className="flex items-start gap-6">
              {/* Preview Image */}
              <div className="w-48 h-32 flex-shrink-0 bg-cream/30 rounded-sm overflow-hidden">
                {banner.desktop_image_url ? (
                  <img
                    src={banner.desktop_image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🖼️
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading text-lg text-chocolate">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-coffee/60">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-sm transition-colors ${
                        banner.is_active
                          ? 'bg-sage/10 text-sage hover:bg-sage/20'
                          : 'bg-coffee/10 text-coffee hover:bg-coffee/20'
                      }`}
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleReorder(banner, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gold/10 rounded-sm transition-colors disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleReorder(banner, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-2 hover:bg-gold/10 rounded-sm transition-colors disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-gold" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-blush" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-coffee/50 text-xs">Duration</p>
                    <p className="text-chocolate">{banner.duration / 1000}s</p>
                  </div>
                  <div>
                    <p className="text-coffee/50 text-xs">Transition</p>
                    <p className="text-chocolate capitalize">{banner.transition_type}</p>
                  </div>
                  <div>
                    <p className="text-coffee/50 text-xs">Order</p>
                    <p className="text-chocolate">{banner.display_order}</p>
                  </div>
                  <div>
                    <p className="text-coffee/50 text-xs">Status</p>
                    <p className={banner.is_active ? 'text-sage' : 'text-coffee/40'}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {banner.button_text && (
                  <div className="mt-3">
                    <p className="text-xs text-coffee/50">Button</p>
                    <p className="text-sm text-chocolate">
                      {banner.button_text} → {banner.button_url || 'No URL'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <p className="text-coffee/40">No hero banners yet. Click "Add Banner" to create one.</p>
          </div>
        )}
      </div>

      {/* Banner Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Content */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Content
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-luxury"
                      placeholder="Where Art Meets"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="input-luxury"
                      placeholder="Elegance."
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
                      placeholder="Hand-Painted Creations, Made With Love."
                    />
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
                      placeholder="Explore Collection"
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
                      placeholder="/collections"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Images
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Desktop Image */}
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Desktop Image *
                    </label>
                    {formData.desktop_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.desktop_image_url}
                          alt="Desktop preview"
                          className="w-full h-40 object-cover rounded-sm border border-beige/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('desktop')}
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
                              <p className="text-xs text-coffee/60">Upload desktop image</p>
                              <p className="text-xs text-coffee/40">1920 × 800px</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'desktop')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Mobile Image
                    </label>
                    {formData.mobile_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.mobile_image_url}
                          alt="Mobile preview"
                          className="w-full h-40 object-cover rounded-sm border border-beige/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('mobile')}
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
                              <p className="text-xs text-coffee/60">Upload mobile image</p>
                              <p className="text-xs text-coffee/40">1080 × 1350px</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'mobile')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Tablet Image */}
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Tablet Image
                    </label>
                    {formData.tablet_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.tablet_image_url}
                          alt="Tablet preview"
                          className="w-full h-40 object-cover rounded-sm border border-beige/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('tablet')}
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
                              <p className="text-xs text-coffee/60">Upload tablet image</p>
                              <p className="text-xs text-coffee/40">Optional</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'tablet')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
                  Settings
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={(formData.duration || 5000) / 1000}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) * 1000 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Transition
                    </label>
                    <select
                      value={formData.transition_type}
                      onChange={(e) => setFormData({ ...formData, transition_type: e.target.value as any })}
                      className="select-luxury"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="fade-slide">Fade + Slide</option>
                    </select>
                  </div>
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
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBanner(null);
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
