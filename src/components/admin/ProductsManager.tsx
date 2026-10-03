import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useData';

export default function ProductsManager() {
  const { products, loading, refetch } = useProducts();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '0',
    category_id: '',
    material: '',
    sizes: '',
    colors: '',
    customization_available: false,
    is_featured: false,
    is_new_arrival: false,
    is_published: false,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || '0',
      category_id: product.category_id || '',
      material: product.material || '',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      customization_available: product.customization_available || false,
      is_featured: product.is_featured || false,
      is_new_arrival: product.is_new_arrival || false,
      is_published: product.is_published || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      sale_price: '',
      stock_quantity: '0',
      category_id: '',
      material: '',
      sizes: '',
      colors: '',
      customization_available: false,
      is_featured: false,
      is_new_arrival: false,
      is_published: false,
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">🛍️ Products Management</h2>
        <button
          onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury !pl-10"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-pearl border border-beige/20 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Product</th>
                <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Price</th>
                <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-label tracking-wider uppercase text-coffee/70">Status</th>
                <th className="px-4 py-3 text-right text-xs font-label tracking-wider uppercase text-coffee/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/20">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-chocolate">{product.name}</p>
                      <p className="text-xs text-coffee/50">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-coffee/70">
                    {product.category?.name || 'Uncategorized'}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-chocolate">₹{product.price}</p>
                      {product.sale_price && (
                        <p className="text-xs text-blush">Sale: ₹{product.sale_price}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-coffee/70">
                    {product.stock_quantity}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-luxury ${
                      product.is_published ? 'bg-sage/10 text-sage' : 'bg-coffee/10 text-coffee'
                    }`}>
                      {product.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} className="text-gold" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-blush" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-coffee/40">No products found</p>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20">
              <h3 className="text-xl font-heading text-chocolate">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Product Name *
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
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="input-luxury"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="select-luxury"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="input-luxury"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="input-luxury"
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="input-luxury"
                    placeholder="Red, Blue, Green"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.customization_available}
                    onChange={(e) => setFormData({ ...formData, customization_available: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Customization Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Featured Product</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">New Arrival</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Published</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}
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
