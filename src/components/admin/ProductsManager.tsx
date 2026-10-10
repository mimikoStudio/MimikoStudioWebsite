import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, Filter, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useData';

export default function ProductsManager() {
  const { products, loading, error: fetchError, refetch } = useProducts({ showAll: true }); // Show all products including drafts
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [publishingAll, setPublishingAll] = useState(false);
  const [viewingImages, setViewingImages] = useState<any>(null); // For image gallery modal
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
    is_published: true, // Default to published so products show on website
    images: [] as string[], // Now stores base64 data URLs
  });

  useEffect(() => {
    if (editingProduct) {
      loadProductImages(editingProduct.id);
    }
  }, [editingProduct]);

  const loadProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          images: data.map((img: any) => img.image_url)
        }));
      }
    } catch (error) {
      // Error loading images handled silently
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert image to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        continue;
      }

      // Validate file size (max 1MB for base64 to avoid database issues)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        errors.push(`${file.name}: Too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 1MB.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      alert(`Some images failed to upload:\n\n${errors.join('\n')}`);
    }

    // Add new images to existing ones
    const totalImages = [...formData.images, ...newImages].slice(0, 5); // Max 5 images
    setFormData(prev => ({
      ...prev,
      images: totalImages
    }));

    // Show success message
    if (newImages.length > 0) {
      console.log(`✅ Successfully converted ${newImages.length} images to base64`);
      alert(`✅ Successfully added ${newImages.length} image${newImages.length > 1 ? 's' : ''}!`);
    } else {
      console.warn('⚠️ No images were successfully converted');
    }

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stock_quantity
    const stockQty = parseInt(formData.stock_quantity);
    if (isNaN(stockQty) || stockQty < 0) {
      alert('❌ Stock quantity must be a non-negative number');
      return;
    }
    
    const productData = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: stockQty,
      category_id: formData.category_id || null,
      material: formData.material,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      customization_available: formData.customization_available,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      is_published: formData.is_published,
    };

    try {
      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) {
          if (error.message.includes('row-level security')) {
            throw new Error('RLS policy is blocking this operation. Please disable RLS in Supabase.');
          }
          throw error;
        }
        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (error) {
          if (error.message.includes('row-level security')) {
            throw new Error('RLS policy is blocking this operation. Please disable RLS in Supabase.');
          }
          throw error;
        }
        productId = data.id;
      }

      // Save images (base64) to database
      if (formData.images.length > 0) {
        console.log(`📸 Saving ${formData.images.length} images for product ${productId}`);
        try {
          await updateProductImages(productId, formData.images);
          console.log('✅ Images saved successfully');
        } catch (imageError: any) {
          console.error('❌ Image upload failed:', imageError);
          alert(`⚠️ Product saved but images failed to upload:\n\n${imageError.message}\n\nYou can edit the product later to add images.`);
        }
      } else {
        console.log('ℹ️ No images to save');
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      refetch();
      alert('✅ Product saved successfully!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const updateProductImages = async (productId: string, imageUrls: string[]) => {
    try {
      console.log(`📸 updateProductImages called with ${imageUrls.length} images for product ${productId}`);
      
      // Step 1: Get old image URLs before deleting
      const { data: oldImages, error: fetchError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (fetchError) {
        console.error('❌ Failed to fetch old images:', fetchError);
      } else {
        console.log(`ℹ️ Found ${oldImages?.length || 0} existing images`);
      }

      // Step 2: Delete database records
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (deleteError) {
        console.error('❌ Failed to delete old images:', deleteError);
        throw new Error(`Failed to delete old images: ${deleteError.message}`);
      }
      console.log('✅ Old images deleted');

      // Step 3: Safely clean up old storage files (only if not referenced by other products)
      if (oldImages && oldImages.length > 0) {
        for (const oldImg of oldImages) {
          const oldUrl = oldImg.image_url;
          
          // Only process Supabase Storage URLs (not base64)
          if (oldUrl && !oldUrl.startsWith('') && oldUrl.includes('supabase.co')) {
            try {
              // Check if this URL is still referenced by any other product
              const { data: references } = await supabase
                .from('product_images')
                .select('id')
                .eq('image_url', oldUrl)
                .limit(1);

              // Only delete if no other product references this image
              if (!references || references.length === 0) {
                // Extract path from URL
                const urlParts = oldUrl.split('/storage/v1/object/public/');
                if (urlParts.length > 1) {
                  const storagePath = urlParts[1];
                  await supabase.storage.from('product-images').remove([storagePath]);
                }
              }
            } catch (cleanupError) {
              // Silently fail cleanup - don't block the main operation
              console.warn('⚠️ Failed to cleanup old image:', cleanupError);
            }
          }
        }
      }

      // Step 4: Insert new images (base64 data URLs)
      if (imageUrls.length > 0) {
        console.log(`📤 Inserting ${imageUrls.length} new images...`);
        
        const imageRecords = imageUrls.map((url, index) => {
          console.log(`Image ${index + 1}: ${url.substring(0, 50)}... (${url.length} chars)`);
          return {
            product_id: productId,
            image_url: url,
            alt_text: `Product image ${index + 1}`,
            display_order: index,
          };
        });

        const { data, error } = await supabase
          .from('product_images')
          .insert(imageRecords)
          .select();

        if (error) {
          console.error('❌ Failed to insert images:', error);
          
          if (error.message.includes('row-level security')) {
            throw new Error('RLS policy is blocking image upload. Please disable RLS on product_images table.');
          }
          
          if (error.message.includes('value too long')) {
            throw new Error('Image is too large. Please use smaller images (under 1MB).');
          }
          
          throw new Error(`Failed to save images: ${error.message}`);
        }

        console.log(`✅ Successfully inserted ${data?.length || 0} images`);
      } else {
        console.log('ℹ️ No new images to insert');
      }

      // Step 5: Invalidate cache by triggering a refetch
      refetch();
    } catch (error: any) {
      console.error('❌ Error in updateProductImages:', error);
      throw error;
    }
  };

  const handleEdit = async (product: any) => {
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
      images: [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await supabase.from('product_images').delete().eq('product_id', id);
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
      is_published: true, // Default to published
      images: [],
    });
  };

  const publishAllProducts = async () => {
    if (!confirm('⚠️ Publish all draft products?\n\nThis will make ALL draft products visible on the website immediately.\n\nContinue?')) return;
    
    setPublishingAll(true);
    try {
      const { data, error, count } = await supabase
        .from('products')
        .update({ is_published: true })
        .eq('is_published', false)
        .select();
      
      if (error) throw error;
      
      alert(`✅ Successfully published ${count || data?.length || 0} product(s)! They will now appear on the website.`);
      refetch();
    } catch (error: any) {
      alert('❌ Error publishing products: ' + error.message);
    } finally {
      setPublishingAll(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  // Debug info
  const draftCount = products.filter(p => !p.is_published).length;
  const publishedCount = products.filter(p => p.is_published).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">🛍️ Products Management</h2>
        <div className="flex gap-3">
          {draftCount > 0 && (
            <button
              onClick={publishAllProducts}
              disabled={publishingAll}
              className="btn-primary flex items-center gap-2 animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              {publishingAll ? (
                <>
                  <div className="spinner-luxury w-4 h-4" />
                  Publishing...
                </>
              ) : (
                <>🚀 Publish All ({draftCount})</>
              )}
            </button>
          )}
          <button
            onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className={`border rounded-sm p-4 mb-6 ${
        draftCount > 0 ? 'bg-gold/10 border-gold/30' : 'bg-sage/10 border-sage/30'
      }`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <span className="text-coffee/60">
              Total: <strong className="text-chocolate">{products.length}</strong>
            </span>
            <span className="text-coffee/60">
              Published: <strong className="text-sage">{publishedCount}</strong>
            </span>
            <span className="text-coffee/60">
              Drafts: <strong className="text-gold">{draftCount}</strong>
            </span>
          </div>
          {fetchError && (
            <span className="text-blush text-xs">⚠️ Error: {fetchError}</span>
          )}
        </div>
        {draftCount > 0 && (
          <div className="mt-3 p-3 bg-white/50 rounded-sm border border-gold/20">
            <p className="text-sm text-chocolate font-medium mb-1">
              ⚠️ {draftCount} product{draftCount > 1 ? 's' : ''} not showing on website!
            </p>
            <p className="text-xs text-coffee/70">
              Draft products are hidden from customers. Click <strong>"🚀 Publish All"</strong> above or click individual status badges to make them visible on the website.
            </p>
          </div>
        )}
        {draftCount === 0 && publishedCount > 0 && (
          <p className="text-xs text-sage mt-2">
            ✅ All products are published and visible on the website!
          </p>
        )}
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
                    <div className="flex items-center gap-3">
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => product.images && product.images.length > 0 && setViewingImages(product)}
                      >
                        {product.images && product.images.length > 0 && product.images[0].image_url ? (
                          <img
                            src={product.images[0].image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-sm border-2 border-beige/20 group-hover:border-gold transition-all"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%23E9DCCB" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="32"%3E📦%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-cream/50 rounded-sm flex items-center justify-center border-2 border-beige/20">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                        {product.images && product.images.length > 1 && (
                          <div className="absolute -bottom-1 -right-1 bg-gold text-white text-xs px-1.5 py-0.5 rounded-sm font-medium">
                            +{product.images.length - 1}
                          </div>
                        )}
                        {product.images && product.images.length > 0 && (
                          <div className="absolute inset-0 bg-chocolate/0 group-hover:bg-chocolate/20 transition-all rounded-sm flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                              View All
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-chocolate">{product.name}</p>
                        <p className="text-xs text-coffee/50">{product.slug}</p>
                        {product.images && product.images.length > 0 ? (
                          <button
                            onClick={() => setViewingImages(product)}
                            className="text-xs text-gold hover:text-chocolate transition-colors mt-1"
                          >
                            📸 {product.images.length} image{product.images.length > 1 ? 's' : ''} - View Gallery
                          </button>
                        ) : (
                          <p className="text-xs text-coffee/40 mt-1">No images</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-coffee/70">
                    {product.category?.name ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-coffee/40">
                        <span className="w-2 h-2 rounded-full bg-coffee/20"></span>
                        Uncategorized
                      </span>
                    )}
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
                    <button
                      onClick={async () => {
                        const newStatus = !product.is_published;
                        const { error } = await supabase
                          .from('products')
                          .update({ is_published: newStatus })
                          .eq('id', product.id);
                        if (!error) refetch();
                      }}
                      className={`badge-luxury cursor-pointer transition-all hover:opacity-80 ${
                        product.is_published ? 'bg-sage/10 text-sage' : 'bg-coffee/10 text-coffee'
                      }`}
                      title={product.is_published ? 'Click to unpublish (hide from website)' : 'Click to publish (show on website)'}
                    >
                      {product.is_published ? '✅ Published' : '📝 Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {product.images && product.images.length > 0 && (
                        <button
                          onClick={() => setViewingImages(product)}
                          className="p-2 hover:bg-sky/10 rounded-sm transition-colors"
                          title={`View ${product.images.length} image(s)`}
                        >
                          <ImageIcon size={16} className="text-sky" />
                        </button>
                      )}
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
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20">
              <h3 className="text-xl font-heading text-chocolate">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">Basic Information</h4>
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
              </div>

              {/* Description */}
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

              {/* Pricing */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">Pricing & Inventory</h4>
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
              </div>

              {/* Category & Details */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">Product Details</h4>
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

                <div className="grid grid-cols-2 gap-4 mt-4">
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
              </div>

              {/* Images - Now using base64 */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">Product Images (Max 2MB each)</h4>
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
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
                {formData.images.length < 5 && (
                  <div>
                    <label className="block">
                      <div className="border-2 border-dashed border-beige hover:border-gold rounded-sm p-8 text-center cursor-pointer transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={32} className="text-gold" />
                          <p className="text-sm text-coffee/70">
                            Click to upload images
                          </p>
                          <p className="text-xs text-coffee/50">
                            PNG, JPG, WEBP up to 2MB each
                          </p>
                          <p className="text-xs text-coffee/50">
                            {formData.images.length} of 5 images uploaded
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <p className="text-xs text-coffee/50 mt-2">
                  💡 Images are stored directly in the database (no storage buckets needed)
                </p>
              </div>

              {/* Options */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-4">Options</h4>
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
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-beige/20">
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

      {/* Image Gallery Modal */}
      {viewingImages && (
        <div className="fixed inset-0 bg-chocolate/70 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <div>
                <h3 className="text-xl font-heading text-chocolate">
                  📸 Product Images
                </h3>
                <p className="text-sm text-coffee/60 mt-1">{viewingImages.name}</p>
              </div>
              <button
                onClick={() => setViewingImages(null)}
                className="text-coffee/60 hover:text-chocolate text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {viewingImages.images && viewingImages.images.length > 0 ? (
                <div className="space-y-6">
                  {/* Image Count */}
                  <div className="bg-gold/10 border border-gold/20 rounded-sm p-4">
                    <p className="text-sm text-chocolate">
                      <strong>{viewingImages.images.length}</strong> image{viewingImages.images.length > 1 ? 's' : ''} uploaded for this product
                    </p>
                  </div>

                  {/* Image Gallery Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewingImages.images.map((img: any, idx: number) => (
                      <div key={idx} className="bg-ivory border border-beige/20 rounded-sm overflow-hidden">
                        <div className="aspect-square bg-gradient-to-br from-cream to-beige/20 flex items-center justify-center">
                          {img.image_url ? (
                            <img
                              src={img.image_url}
                              alt={`${viewingImages.name} - Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23E9DCCB" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="%234B2818"%3E📦%3C/text%3E%3Ctext x="50%25" y="60%25" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%236B3E28"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="text-center">
                              <span className="text-6xl block mb-2">📦</span>
                              <p className="text-sm text-coffee/40">No image data</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-chocolate">
                                Image {idx + 1}
                                {idx === 0 && (
                                  <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-sm">
                                    Main Image
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-coffee/50 mt-1">
                                {img.alt_text || `Product image ${idx + 1}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-coffee/50">
                                Order: {img.display_order}
                              </p>
                              {img.image_url && (
                                <p className="text-xs text-coffee/40 mt-1">
                                  Size: {(img.image_url.length / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Image Info */}
                  <div className="bg-cream/50 border border-beige/20 rounded-sm p-4">
                    <h4 className="text-sm font-medium text-chocolate mb-2">📊 Image Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-coffee/50">Total Images</p>
                        <p className="text-chocolate font-medium">{viewingImages.images.length}</p>
                      </div>
                      <div>
                        <p className="text-coffee/50">Total Size</p>
                        <p className="text-chocolate font-medium">
                          {(viewingImages.images.reduce((sum: number, img: any) => sum + (img.image_url?.length || 0), 0) / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div>
                        <p className="text-coffee/50">Format</p>
                        <p className="text-chocolate font-medium">Base64</p>
                      </div>
                      <div>
                        <p className="text-coffee/50">Storage</p>
                        <p className="text-chocolate font-medium">Database</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-beige/20">
                    <button
                      onClick={() => {
                        setViewingImages(null);
                        handleEdit(viewingImages);
                      }}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit size={16} /> Edit Product & Images
                    </button>
                    <button
                      onClick={() => setViewingImages(null)}
                      className="btn-outline flex-1"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">📦</span>
                  <p className="text-coffee/40 text-lg mb-2">No images uploaded</p>
                  <p className="text-coffee/50 text-sm mb-6">
                    This product doesn't have any images yet.
                  </p>
                  <button
                    onClick={() => {
                      setViewingImages(null);
                      handleEdit(viewingImages);
                    }}
                    className="btn-primary"
                  >
                    Upload Images
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
