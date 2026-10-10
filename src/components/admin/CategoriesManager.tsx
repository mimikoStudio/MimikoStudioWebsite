import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useCategories } from '../../hooks/useData';

export default function CategoriesManager() {
  const { categories, loading, refetch } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_hi: '',
    name_gu: '',
    slug: '',
    description: '',
    description_hi: '',
    description_gu: '',
    image_url: '',
    icon: '',
    display_order: '0',
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      display_order: parseInt(formData.display_order),
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([categoryData]);
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      name_hi: category.name_hi || '',
      name_gu: category.name_gu || '',
      slug: category.slug || '',
      description: category.description || '',
      description_hi: category.description_hi || '',
      description_gu: category.description_gu || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      display_order: category.display_order?.toString() || '0',
      is_active: category.is_active ?? true,
      is_featured: category.is_featured ?? false,
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_hi: '',
      name_gu: '',
      slug: '',
      description: '',
      description_hi: '',
      description_gu: '',
      image_url: '',
      icon: '',
      display_order: '0',
      is_active: true,
      is_featured: false,
      seo_title: '',
      seo_description: '',
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">🗂️ Categories Management</h2>
        <button
          onClick={() => { setShowForm(true); setEditingCategory(null); resetForm(); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-pearl border border-beige/20 rounded-sm p-6 hover:shadow-luxury transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading text-lg text-chocolate">{category.name}</h3>
                <p className="text-xs text-coffee/50">{category.slug}</p>
              </div>
              <span className={`badge-luxury ${
                category.is_active ? 'bg-sage/10 text-sage' : 'bg-coffee/10 text-coffee'
              }`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-coffee/70 mb-4">{category.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="btn-outline flex items-center justify-center"
              >
                <Trash2 size={14} className="text-blush" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No categories found</p>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-lg w-full">
            <div className="p-6 border-b border-beige/20">
              <h3 className="text-xl font-heading text-chocolate">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Category Name (Hindi)
                </label>
                <input
                  type="text"
                  value={formData.name_hi}
                  onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                  className="input-luxury"
                  placeholder="श्रेणी का नाम"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Category Name (Gujarati)
                </label>
                <input
                  type="text"
                  value={formData.name_gu}
                  onChange={(e) => setFormData({ ...formData, name_gu: e.target.value })}
                  className="input-luxury"
                  placeholder="શ્રેણીનું નામ"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-luxury"
                  placeholder="auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description (Hindi)
                </label>
                <textarea
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="विवरण..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description (Gujarati)
                </label>
                <textarea
                  value={formData.description_gu}
                  onChange={(e) => setFormData({ ...formData, description_gu: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="વર્ણન..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-luxury"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-luxury"
                  placeholder="🎨"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="input-luxury"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="textarea-luxury"
                  rows={2}
                  placeholder="SEO description for search engines"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Featured Category</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCategory(null); resetForm(); }}
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
